import type {
  CreateProductInput,
  ProductDTO,
  ProductFilters,
  ProductSalesSummaryDTO,
  ProductSummaryDTO,
  ProductSummaryFilters,
  ProductStatus,
  UpdateProductInput,
} from '../domain/products/product.types'
import { calculateInventoryValue } from '../domain/products/productCalculations'
import { productSalesSummaryRepository } from './productSalesSummary.repository'
import { supabaseClient } from '../services/supabase/supabaseClient'
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '../services/supabase/database.types'

type ProductRow = Tables<'products'>

const productSelect = `
  id,
  name,
  size,
  image_url,
  internal_code,
  category,
  unit,
  current_stock,
  minimum_stock,
  average_cost,
  sale_price,
  sale_price_open,
  notes,
  status,
  created_at,
  updated_at
`

const productStatuses = ['active', 'inactive'] as const satisfies readonly ProductStatus[]
const pendingReceiptStatuses = ['pending', 'partial'] as const

function addMoney(total: number, value: number) {
  return Number((total + value).toFixed(2))
}

const csvHeaders = [
  'Produto',
  'Tamanho',
  'Saldo',
  'Minimo',
  'Custo Medio',
  'Preco Venda',
  'Valor Estoque',
  'Vendidos',
  'Receita',
  'Lucro Bruto',
  'Recebido',
  'Status',
]

function csvValue(value: number | string | null | undefined) {
  const stringValue = value === null || value === undefined ? '' : String(value)

  if (
    stringValue.includes(';') ||
    stringValue.includes('"') ||
    stringValue.includes('\n')
  ) {
    return `"${stringValue.replaceAll('"', '""')}"`
  }

  return stringValue
}

function formatCsvMoney(value: number) {
  return value.toFixed(2)
}

function formatCsvNullableMoney(value: number | null) {
  return value === null ? 'Pendente' : formatCsvMoney(value)
}

function formatCsvSalePrice(salePrice: number | null, salePriceOpen: boolean) {
  if (salePriceOpen) {
    return 'Aberto'
  }

  return formatCsvNullableMoney(salePrice)
}

function formatCsvStockValue(
  currentStock: number,
  averageCost: number | null,
) {
  const value = calculateInventoryValue(currentStock, averageCost)

  return value === null ? 'Pendente' : formatCsvMoney(value)
}

function toSalesSummaryMap(rows: ProductSalesSummaryDTO[]) {
  return new Map(rows.map((row) => [row.productId, row]))
}

function isProductStatus(status: string): status is ProductStatus {
  return productStatuses.includes(status as ProductStatus)
}

function toProductDTO(row: Omit<ProductRow, 'user_id'>): ProductDTO {
  if (!isProductStatus(row.status)) {
    throw new Error(`Status de produto invalido: ${row.status}`)
  }

  return {
    averageCost: row.average_cost,
    category: row.category,
    createdAt: row.created_at,
    currentStock: row.current_stock,
    id: row.id,
    imageUrl: row.image_url,
    internalCode: row.internal_code,
    minimumStock: row.minimum_stock,
    name: row.name,
    notes: row.notes,
    salePrice: row.sale_price,
    salePriceOpen: row.sale_price_open,
    size: row.size,
    status: row.status,
    unit: row.unit,
    updatedAt: row.updated_at,
  }
}

async function getRequiredUserId() {
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser()

  if (error || !user) {
    throw error ?? new Error('Usuario autenticado nao encontrado.')
  }

  return user.id
}

function toProductCreate(
  input: CreateProductInput,
  userId: string,
): TablesInsert<'products'> {
  return {
    average_cost: input.averageCost ?? null,
    category: input.category ?? null,
    current_stock: 0,
    image_url: input.imageUrl ?? null,
    internal_code: input.internalCode ?? null,
    minimum_stock: input.minimumStock,
    name: input.name,
    notes: input.notes ?? null,
    sale_price: input.salePriceOpen ? null : (input.salePrice ?? null),
    sale_price_open: input.salePriceOpen,
    size: input.size,
    unit: input.unit,
    user_id: userId,
  }
}

function toProductUpdate(input: UpdateProductInput): TablesUpdate<'products'> {
  const update: TablesUpdate<'products'> = {}

  if (input.averageCost !== undefined) {
    update.average_cost = input.averageCost
  }

  if (input.category !== undefined) {
    update.category = input.category
  }

  if (input.imageUrl !== undefined) {
    update.image_url = input.imageUrl
  }

  if (input.internalCode !== undefined) {
    update.internal_code = input.internalCode
  }

  if (input.minimumStock !== undefined) {
    update.minimum_stock = input.minimumStock
  }

  if (input.name !== undefined) {
    update.name = input.name
  }

  if (input.notes !== undefined) {
    update.notes = input.notes
  }

  if (input.salePriceOpen !== undefined) {
    update.sale_price_open = input.salePriceOpen

    if (input.salePriceOpen) {
      update.sale_price = null
    }
  }

  if (input.salePrice !== undefined) {
    update.sale_price = input.salePrice
  }

  if (input.size !== undefined) {
    update.size = input.size
  }

  if (input.status !== undefined) {
    update.status = input.status
  }

  if (input.unit !== undefined) {
    update.unit = input.unit
  }

  return update
}

function sumProductsValue(products: Array<Pick<ProductRow, 'average_cost' | 'current_stock'>>) {
  return products.reduce((total, product) => {
    const inventoryValue = calculateInventoryValue(
      product.current_stock,
      product.average_cost,
    )

    return inventoryValue === null ? total : addMoney(total, inventoryValue)
  }, 0)
}

export const productRepository = {
  async list(filters: ProductFilters = {}): Promise<ProductDTO[]> {
    let query = supabaseClient
      .from('products')
      .select(productSelect)
      .order('name', { ascending: true })
      .order('size', { ascending: true })

    if (filters.search) {
      const search = `%${filters.search}%`
      query = query.or(
        `name.ilike.${search},size.ilike.${search},internal_code.ilike.${search},category.ilike.${search}`,
      )
    }

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters.pendingData) {
      query = query.or(
        'sale_price_open.eq.true,sale_price.is.null,average_cost.is.null',
      )
    }

    const pendingPaymentQuery = filters.paymentPending
      ? supabaseClient
          .from('stock_movements')
          .select('product_id')
          .eq('type', 'sale')
          .in('receipt_status', [...pendingReceiptStatuses])
      : null

    const [productsResult, pendingPaymentResult] = await Promise.all([
      query,
      pendingPaymentQuery,
    ])

    const { data, error } = productsResult

    if (error) {
      throw error
    }

    if (pendingPaymentResult?.error) {
      throw pendingPaymentResult.error
    }

    const pendingPaymentProductIds = new Set(
      (pendingPaymentResult?.data ?? []).map((movement) => movement.product_id),
    )
    const products = data
      .map(toProductDTO)
      .filter(
        (product) =>
          !filters.paymentPending || pendingPaymentProductIds.has(product.id),
      )

    if (filters.lowStock) {
      return products.filter(
        (product) => product.currentStock <= product.minimumStock,
      )
    }

    return products
  },

  async getById(id: string): Promise<ProductDTO> {
    const { data, error } = await supabaseClient
      .from('products')
      .select(productSelect)
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return toProductDTO(data)
  },

  async create(input: CreateProductInput): Promise<ProductDTO> {
    const userId = await getRequiredUserId()

    const { data, error } = await supabaseClient
      .from('products')
      .insert(toProductCreate(input, userId))
      .select(productSelect)
      .single()

    if (error) {
      throw error
    }

    return toProductDTO(data)
  },

  async update(id: string, input: UpdateProductInput): Promise<ProductDTO> {
    const { data, error } = await supabaseClient
      .from('products')
      .update(toProductUpdate(input))
      .eq('id', id)
      .select(productSelect)
      .single()

    if (error) {
      throw error
    }

    return toProductDTO(data)
  },

  async deactivate(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from('products')
      .update({ status: 'inactive' })
      .eq('id', id)

    if (error) {
      throw error
    }
  },

  async getSummary(
    filters: ProductSummaryFilters = {},
  ): Promise<ProductSummaryDTO> {
    const [productsResult, movementsResult] = await Promise.all([
      supabaseClient
        .from('products')
        .select('current_stock, minimum_stock, average_cost, sale_price, sale_price_open, status'),
      supabaseClient
        .from('stock_movements')
        .select('payment_method, amount_received, revenue_value, gross_profit_value, occurred_at, type')
        .eq('type', 'sale')
        .order('occurred_at', { ascending: false }),
    ])

    const { data: products, error: productsError } = productsResult
    const { data: movements, error: movementsError } = movementsResult

    if (productsError) {
      throw productsError
    }

    if (movementsError) {
      throw movementsError
    }

    const filteredMovements = movements.filter((movement) => {
      if (filters.dateFrom && movement.occurred_at < filters.dateFrom) {
        return false
      }

      if (filters.dateTo && movement.occurred_at > filters.dateTo) {
        return false
      }

      return true
    })

    const activeProductsCount = products.filter(
      (product) => product.status === 'active',
    ).length
    const lowStockCount = products.filter(
      (product) => product.current_stock <= product.minimum_stock,
    ).length
    const zeroStockCount = products.filter(
      (product) => product.current_stock === 0,
    ).length
    const pendingDataCount = products.filter(
      (product) =>
        product.sale_price_open ||
        product.sale_price === null ||
        product.average_cost === null,
    ).length

    const inventoryValue = sumProductsValue(
      products.filter((product) => product.average_cost !== null),
    )

    const receivedByPaymentMethod = filteredMovements.reduce(
      (totals, movement) => {
        if (movement.payment_method === 'pix') {
          totals.pix = addMoney(totals.pix, movement.amount_received)
        }

        if (movement.payment_method === 'card') {
          totals.card = addMoney(totals.card, movement.amount_received)
        }

        if (movement.payment_method === 'cash') {
          totals.cash = addMoney(totals.cash, movement.amount_received)
        }

        return totals
      },
      { pix: 0, card: 0, cash: 0 },
    )

    const periodRevenue = filteredMovements.reduce(
      (total, movement) => addMoney(total, movement.revenue_value),
      0,
    )
    const periodGrossProfit = filteredMovements.reduce(
      (total, movement) => addMoney(total, movement.gross_profit_value),
      0,
    )
    const periodReceived = filteredMovements.reduce(
      (total, movement) => addMoney(total, movement.amount_received),
      0,
    )

    return {
      activeProductsCount,
      lowStockCount,
      zeroStockCount,
      pendingDataCount,
      inventoryValue,
      periodRevenue,
      periodGrossProfit,
      periodReceived,
      receivedByPaymentMethod,
    }
  },

  async exportCsv(filters: ProductFilters = {}): Promise<string> {
    const [products, salesSummary] = await Promise.all([
      productRepository.list(filters),
      productSalesSummaryRepository.getByProduct(),
    ])

    const salesSummaryByProductId = toSalesSummaryMap(salesSummary)

    const lines = [
      csvHeaders.join(';'),
      ...products.map((product) => {
        const summary = salesSummaryByProductId.get(product.id)

        return [
          product.name,
          product.size,
          product.currentStock,
          product.minimumStock,
          formatCsvNullableMoney(product.averageCost),
          formatCsvSalePrice(product.salePrice, product.salePriceOpen),
          formatCsvStockValue(product.currentStock, product.averageCost),
          summary?.soldQuantity ?? 0,
          formatCsvMoney(summary?.revenueValue ?? 0),
          formatCsvMoney(summary?.grossProfitValue ?? 0),
          formatCsvMoney(summary?.amountReceived ?? 0),
          product.status === 'active' ? 'Ativo' : 'Inativo',
        ]
          .map(csvValue)
          .join(';')
      }),
    ]

    return lines.join('\n')
  },
}
