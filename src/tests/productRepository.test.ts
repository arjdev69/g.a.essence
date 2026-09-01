import { beforeEach, describe, expect, it, vi } from 'vitest'

const repositoryMock = vi.hoisted(() => {
  const products = [
    {
      average_cost: 62,
      category: 'Oleos',
      created_at: '2026-09-01T10:00:00Z',
      current_stock: 2,
      id: 'product-pending',
      image_url: null,
      internal_code: 'PENDING-001',
      minimum_stock: 1,
      name: 'Lavanda',
      notes: null,
      sale_price: 94.5,
      sale_price_open: false,
      size: '5ml',
      status: 'active',
      unit: 'un',
      updated_at: '2026-09-01T10:00:00Z',
    },
    {
      average_cost: 40,
      category: 'Cremes',
      created_at: '2026-09-01T10:00:00Z',
      current_stock: 3,
      id: 'product-received',
      image_url: null,
      internal_code: 'RECEIVED-001',
      minimum_stock: 1,
      name: 'Hidratante',
      notes: null,
      sale_price: 80,
      sale_price_open: false,
      size: '100ml',
      status: 'active',
      unit: 'un',
      updated_at: '2026-09-01T10:00:00Z',
    },
    {
      average_cost: 35,
      category: 'Sais',
      created_at: '2026-09-01T10:00:00Z',
      current_stock: 4,
      id: 'product-partial',
      image_url: null,
      internal_code: 'PARTIAL-001',
      minimum_stock: 1,
      name: 'Sais de banho',
      notes: null,
      sale_price: 70,
      sale_price_open: false,
      size: '200g',
      status: 'active',
      unit: 'un',
      updated_at: '2026-09-01T10:00:00Z',
    },
  ]
  const pendingPaymentMovements = [
    { product_id: 'product-pending' },
    { product_id: 'product-partial' },
  ]
  const calls: string[] = []

  function createQuery(kind: 'products' | 'stock_movements') {
    const query = {
      eq: vi.fn((column: string, value: unknown) => {
        calls.push(`${kind}.eq:${column}=${String(value)}`)
        return query
      }),
      in: vi.fn((column: string, values: unknown[]) => {
        calls.push(`${kind}.in:${column}=${values.join(',')}`)
        return query
      }),
      lte: vi.fn(() => query),
      gte: vi.fn(() => query),
      or: vi.fn(() => query),
      order: vi.fn(() => query),
      select: vi.fn(() => query),
      then: (
        onFulfilled: (value: { data: unknown[]; error: null }) => unknown,
        onRejected?: (reason: unknown) => unknown,
      ) =>
        Promise.resolve({
          data: kind === 'products' ? products : pendingPaymentMovements,
          error: null,
        }).then(onFulfilled, onRejected),
    }

    return query
  }

  const productQuery = createQuery('products')
  const movementQuery = createQuery('stock_movements')

  return {
    calls,
    from: vi.fn((table: string) => {
      calls.push(`from:${table}`)
      return table === 'products' ? productQuery : movementQuery
    }),
    movementQuery,
    productQuery,
  }
})

vi.mock('../services/supabase/supabaseClient', () => ({
  supabaseClient: {
    auth: { getUser: vi.fn() },
    from: repositoryMock.from,
  },
}))

import { productRepository } from '../repositories/product.repository'

describe('productRepository payment filters', () => {
  beforeEach(() => {
    repositoryMock.calls.length = 0
    vi.clearAllMocks()
  })

  it('returns products with pending or partial sales when the fiado filter is active', async () => {
    const products = await productRepository.list({ paymentPending: true })

    expect(products.map((product) => product.id)).toEqual([
      'product-pending',
      'product-partial',
    ])
    expect(repositoryMock.calls).toContain('from:stock_movements')
    expect(repositoryMock.movementQuery.eq).toHaveBeenCalledWith('type', 'sale')
    expect(repositoryMock.movementQuery.in).toHaveBeenCalledWith(
      'receipt_status',
      ['pending', 'partial'],
    )
  })

  it('does not query movements when the payment filter is inactive', async () => {
    const products = await productRepository.list()

    expect(products).toHaveLength(3)
    expect(repositoryMock.from).toHaveBeenCalledTimes(1)
    expect(repositoryMock.from).toHaveBeenCalledWith('products')
  })
})
