import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { Database } from '../services/supabase/database.types'

type CreateStockMovementArgs = {
  input_adjustment_delta?: number | null
  input_amount_received?: number
  input_notes?: string | null
  input_occurred_at?: string | null
  input_payment_method?: string | null
  input_product_id: string
  input_quantity: number
  input_receipt_status?: string | null
  input_type: string
  input_unit_cost?: number | null
  input_unit_sale_price?: number | null
}

type IntegrationDatabase = Omit<Database, 'public'> & {
  public: Omit<Database['public'], 'Functions'> & {
    Functions: {
      create_stock_movement: {
        Args: CreateStockMovementArgs
        Returns: Database['public']['Tables']['stock_movements']['Row']
      }
    }
  }
}

type IntegrationClient = SupabaseClient<IntegrationDatabase>
type ProductInsert = IntegrationDatabase['public']['Tables']['products']['Insert']
type ProductRow = IntegrationDatabase['public']['Tables']['products']['Row']

const shouldRunIntegration =
  import.meta.env.RUN_SUPABASE_INTEGRATION_TESTS === 'true'

const supabaseUrl =
  import.meta.env.SUPABASE_TEST_URL ?? import.meta.env.VITE_SUPABASE_URL

const supabasePublishableKey =
  import.meta.env.SUPABASE_TEST_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

const supabaseServiceRoleKey = import.meta.env.SUPABASE_TEST_SERVICE_ROLE_KEY

const describeIntegration = shouldRunIntegration ? describe : describe.skip

function makeClient(key: string): IntegrationClient {
  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_TEST_URL or VITE_SUPABASE_URL')
  }

  return createClient<IntegrationDatabase>(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  })
}

async function signInTestUser(email: string, password: string) {
  if (!supabasePublishableKey) {
    throw new Error(
      'Missing SUPABASE_TEST_PUBLISHABLE_KEY or VITE_SUPABASE_PUBLISHABLE_KEY',
    )
  }

  const client = makeClient(supabasePublishableKey)
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  if (!data.user) {
    throw new Error(`Failed to sign in integration user ${email}`)
  }

  return { client, userId: data.user.id }
}

async function createProduct(
  client: IntegrationClient,
  userId: string,
  overrides: Partial<ProductInsert> = {},
): Promise<ProductRow> {
  const { data, error } = await client
    .from('products')
    .insert({
      name: `Integration Product ${crypto.randomUUID()}`,
      size: '5ml',
      unit: 'un',
      user_id: userId,
      ...overrides,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

async function getProduct(
  client: IntegrationClient,
  productId: string,
): Promise<ProductRow> {
  const { data, error } = await client
    .from('products')
    .select()
    .eq('id', productId)
    .single()

  if (error) {
    throw error
  }

  return data
}

async function countProductMovements(
  client: IntegrationClient,
  productId: string,
) {
  const { count, error } = await client
    .from('stock_movements')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', productId)

  if (error) {
    throw error
  }

  return count ?? 0
}

describeIntegration.sequential('products RPC and RLS integration', () => {
  let adminClient: IntegrationClient
  let firstUserClient: IntegrationClient
  let secondUserClient: IntegrationClient
  let firstUserId: string
  let secondUserId: string
  const createdUserIds: string[] = []

  beforeAll(async () => {
    if (!supabaseServiceRoleKey) {
      throw new Error('Missing SUPABASE_TEST_SERVICE_ROLE_KEY')
    }

    adminClient = makeClient(supabaseServiceRoleKey)

    const password = `Products-${crypto.randomUUID()}-123456`
    const firstEmail = `products-rpc-a-${crypto.randomUUID()}@example.test`
    const secondEmail = `products-rpc-b-${crypto.randomUUID()}@example.test`

    for (const email of [firstEmail, secondEmail]) {
      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        email_confirm: true,
        password,
      })

      if (error) {
        throw error
      }

      if (!data.user) {
        throw new Error(`Failed to create integration user ${email}`)
      }

      createdUserIds.push(data.user.id)
    }

    const firstUser = await signInTestUser(firstEmail, password)
    const secondUser = await signInTestUser(secondEmail, password)

    firstUserClient = firstUser.client
    firstUserId = firstUser.userId
    secondUserClient = secondUser.client
    secondUserId = secondUser.userId
  })

  afterAll(async () => {
    if (!adminClient || createdUserIds.length === 0) {
      return
    }

    await adminClient.from('stock_movements').delete().in('user_id', createdUserIds)
    await adminClient.from('products').delete().in('user_id', createdUserIds)

    await Promise.all(
      createdUserIds.map((userId) =>
        adminClient.auth.admin.deleteUser(userId),
      ),
    )
  })

  it('creates a purchase movement and updates stock in the same operation', async () => {
    const product = await createProduct(firstUserClient, firstUserId)

    const { data, error } = await firstUserClient.rpc('create_stock_movement', {
      input_product_id: product.id,
      input_quantity: 3,
      input_type: 'purchase',
      input_unit_cost: 198,
    })

    expect(error).toBeNull()
    expect(data).toMatchObject({
      product_id: product.id,
      quantity: 3,
      stock_delta: 3,
      type: 'purchase',
      unit_cost: 198,
    })

    const updatedProduct = await getProduct(firstUserClient, product.id)

    expect(updatedProduct.current_stock).toBe(3)
    expect(updatedProduct.average_cost).toBe(198)
  })

  it('rolls back a sale when stock is insufficient', async () => {
    const product = await createProduct(firstUserClient, firstUserId, {
      average_cost: 120,
      current_stock: 1,
      sale_price: 198,
      sale_price_open: false,
    })

    const { error } = await firstUserClient.rpc('create_stock_movement', {
      input_amount_received: 396,
      input_payment_method: 'pix',
      input_product_id: product.id,
      input_quantity: 2,
      input_receipt_status: 'received',
      input_type: 'sale',
      input_unit_sale_price: 198,
    })

    expect(error?.message).toContain('Estoque insuficiente')

    const updatedProduct = await getProduct(firstUserClient, product.id)
    const movementCount = await countProductMovements(
      firstUserClient,
      product.id,
    )

    expect(updatedProduct.current_stock).toBe(1)
    expect(movementCount).toBe(0)
  })

  it('blocks movement for inactive product', async () => {
    const product = await createProduct(firstUserClient, firstUserId, {
      average_cost: 120,
      current_stock: 3,
      sale_price: 198,
      sale_price_open: false,
      status: 'inactive',
    })

    const { error } = await firstUserClient.rpc('create_stock_movement', {
      input_product_id: product.id,
      input_quantity: 1,
      input_type: 'purchase',
      input_unit_cost: 120,
    })

    expect(error?.message).toContain('Produto inativo')

    const updatedProduct = await getProduct(firstUserClient, product.id)
    const movementCount = await countProductMovements(
      firstUserClient,
      product.id,
    )

    expect(updatedProduct.current_stock).toBe(3)
    expect(movementCount).toBe(0)
  })

  it('blocks access to another user products and stock movements', async () => {
    const product = await createProduct(firstUserClient, firstUserId)

    const { data: movement, error: movementError } =
      await firstUserClient.rpc('create_stock_movement', {
        input_product_id: product.id,
        input_quantity: 1,
        input_type: 'purchase',
        input_unit_cost: 120,
      })

    expect(movementError).toBeNull()

    const { data: otherUserProducts, error: productsError } =
      await secondUserClient
        .from('products')
        .select('id')
        .eq('id', product.id)

    expect(productsError).toBeNull()
    expect(otherUserProducts).toEqual([])

    const { data: otherUserMovements, error: movementsError } =
      await secondUserClient
        .from('stock_movements')
        .select('id')
        .eq('id', movement?.id ?? '')

    expect(movementsError).toBeNull()
    expect(otherUserMovements).toEqual([])

    const { error: rpcError } = await secondUserClient.rpc(
      'create_stock_movement',
      {
        input_product_id: product.id,
        input_quantity: 1,
        input_type: 'purchase',
        input_unit_cost: 120,
      },
    )

    expect(rpcError?.message).toContain('Produto nao encontrado')
    expect(secondUserId).not.toBe(firstUserId)
  })

  it('blocks sale without average cost', async () => {
    const product = await createProduct(firstUserClient, firstUserId, {
      average_cost: null,
      current_stock: 2,
      sale_price: 198,
      sale_price_open: false,
    })

    const { error } = await firstUserClient.rpc('create_stock_movement', {
      input_amount_received: 198,
      input_payment_method: 'pix',
      input_product_id: product.id,
      input_quantity: 1,
      input_receipt_status: 'received',
      input_type: 'sale',
      input_unit_sale_price: 198,
    })

    expect(error?.message).toContain('Venda exige custo medio definido')

    const updatedProduct = await getProduct(firstUserClient, product.id)
    const movementCount = await countProductMovements(
      firstUserClient,
      product.id,
    )

    expect(updatedProduct.current_stock).toBe(2)
    expect(movementCount).toBe(0)
  })

  it('blocks fractional quantity', async () => {
    const product = await createProduct(firstUserClient, firstUserId)

    const { error } = await firstUserClient.rpc('create_stock_movement', {
      input_product_id: product.id,
      input_quantity: 1.5,
      input_type: 'purchase',
      input_unit_cost: 120,
    })

    expect(error?.message).toContain('quantidade deve ser um inteiro')

    const updatedProduct = await getProduct(firstUserClient, product.id)
    const movementCount = await countProductMovements(
      firstUserClient,
      product.id,
    )

    expect(updatedProduct.current_stock).toBe(0)
    expect(movementCount).toBe(0)
  })

  it.each([
    {
      amountReceived: 100,
      receiptStatus: 'received',
      title: 'received sale with amount below revenue',
    },
    {
      amountReceived: 1,
      receiptStatus: 'pending',
      title: 'pending sale with amount received',
    },
    {
      amountReceived: 0,
      receiptStatus: 'partial',
      title: 'partial sale without amount received',
    },
    {
      amountReceived: 198,
      receiptStatus: 'partial',
      title: 'partial sale with full amount received',
    },
  ])('applies receipt rules for $title', async ({ amountReceived, receiptStatus }) => {
    const product = await createProduct(firstUserClient, firstUserId, {
      average_cost: 120,
      current_stock: 2,
      sale_price: 198,
      sale_price_open: false,
    })

    const { error } = await firstUserClient.rpc('create_stock_movement', {
      input_amount_received: amountReceived,
      input_payment_method: 'pix',
      input_product_id: product.id,
      input_quantity: 1,
      input_receipt_status: receiptStatus,
      input_type: 'sale',
      input_unit_sale_price: 198,
    })

    expect(error).not.toBeNull()

    const updatedProduct = await getProduct(firstUserClient, product.id)
    const movementCount = await countProductMovements(
      firstUserClient,
      product.id,
    )

    expect(updatedProduct.current_stock).toBe(2)
    expect(movementCount).toBe(0)
  })
})
