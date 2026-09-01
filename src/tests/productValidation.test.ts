import { describe, expect, it } from 'vitest'

import { productSchema } from '../features/products/product.schema'
import { stockMovementSchema } from '../features/products/stockMovement.schema'

function expectInvalidPath(
  result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } },
  path: string,
) {
  expect(result.success).toBe(false)

  if (result.success || !result.error) {
    throw new Error(`Expected validation error at ${path}`)
  }

  expect(
    result.error.issues.some((issue) => issue.path.join('.') === path),
  ).toBe(true)
}

function makeProductInput(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    averageCost: '',
    category: 'Oleos',
    internalCode: '',
    minimumStock: '1',
    name: 'Lavanda',
    notes: '',
    salePrice: '62',
    salePriceOpen: false,
    size: '5ml',
    unit: 'un',
    ...overrides,
  }
}

function makeSaleInput(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    amountReceived: '198',
    averageCost: '120',
    currentStock: '3',
    paymentMethod: 'pix',
    productId: 'product-1',
    productStatus: 'active',
    quantity: '1',
    receiptStatus: 'received',
    type: 'sale',
    unitSalePrice: '198',
    ...overrides,
  }
}

describe('productSchema', () => {
  it('accepts a valid product with sale price defined', () => {
    const result = productSchema.safeParse(makeProductInput())

    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error(result.error.message)
    }

    expect(result.data).toEqual({
      averageCost: null,
      category: 'Oleos',
      internalCode: null,
      minimumStock: 1,
      name: 'Lavanda',
      notes: null,
      salePrice: 62,
      salePriceOpen: false,
      size: '5ml',
      unit: 'un',
    })
  })

  it('accepts a product with open price and pending average cost', () => {
    const result = productSchema.safeParse(
      makeProductInput({
        averageCost: '',
        salePrice: '',
        salePriceOpen: true,
      }),
    )

    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error(result.error.message)
    }

    expect(result.data.averageCost).toBeNull()
    expect(result.data.salePrice).toBeNull()
  })

  it.each([
    { field: 'name', value: '', path: 'name' },
    { field: 'size', value: '', path: 'size' },
    { field: 'unit', value: '', path: 'unit' },
    { field: 'minimumStock', value: '-1', path: 'minimumStock' },
    { field: 'averageCost', value: '-1', path: 'averageCost' },
    { field: 'salePrice', value: '-1', path: 'salePrice' },
  ])('rejects invalid product field $field', ({ field, value, path }) => {
    expectInvalidPath(
      productSchema.safeParse(makeProductInput({ [field]: value })),
      path,
    )
  })

  it('rejects sale price equal to zero when open price is disabled', () => {
    expectInvalidPath(
      productSchema.safeParse(makeProductInput({ salePrice: '0' })),
      'salePrice',
    )
  })

  it('rejects missing sale price when open price is disabled', () => {
    expectInvalidPath(
      productSchema.safeParse(makeProductInput({ salePrice: '' })),
      'salePrice',
    )
  })

  it('rejects direct initial stock in product creation input', () => {
    expectInvalidPath(
      productSchema.safeParse(makeProductInput({ currentStock: 1 })),
      'currentStock',
    )
  })
})

describe('stockMovementSchema', () => {
  it('accepts a purchase movement and clears sale-only fields', () => {
    const result = stockMovementSchema.safeParse({
      amountReceived: '10',
      currentStock: '0',
      paymentMethod: 'pix',
      productId: 'product-1',
      quantity: '3',
      receiptStatus: 'received',
      type: 'purchase',
      unitCost: '198',
      unitSalePrice: '250',
    })

    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error(result.error.message)
    }

    expect(result.data).toMatchObject({
      amountReceived: 0,
      paymentMethod: null,
      productId: 'product-1',
      quantity: 3,
      receiptStatus: null,
      type: 'purchase',
      unitCost: 198,
      unitSalePrice: null,
    })
  })

  it('accepts a received sale movement', () => {
    const result = stockMovementSchema.safeParse(makeSaleInput())

    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error(result.error.message)
    }

    expect(result.data).toMatchObject({
      amountReceived: 198,
      paymentMethod: 'pix',
      productId: 'product-1',
      quantity: 1,
      receiptStatus: 'received',
      type: 'sale',
      unitCost: null,
      unitSalePrice: 198,
    })
  })

  it('accepts an adjustment and persists positive quantity from signed delta', () => {
    const result = stockMovementSchema.safeParse({
      adjustmentDelta: '-2',
      currentStock: '3',
      productId: 'product-1',
      quantity: '',
      type: 'adjustment',
    })

    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error(result.error.message)
    }

    expect(result.data).toMatchObject({
      adjustmentDelta: -2,
      amountReceived: 0,
      paymentMethod: null,
      productId: 'product-1',
      quantity: 2,
      receiptStatus: null,
      type: 'adjustment',
    })
  })

  it.each([
    { field: 'productId', value: '', path: 'productId' },
    { field: 'quantity', value: '0', path: 'quantity' },
    { field: 'quantity', value: '-1', path: 'quantity' },
    { field: 'quantity', value: '1.5', path: 'quantity' },
    { field: 'currentStock', value: '0', path: 'quantity' },
    { field: 'productStatus', value: 'inactive', path: 'productId' },
    { field: 'averageCost', value: '', path: 'averageCost' },
    { field: 'unitSalePrice', value: '0', path: 'unitSalePrice' },
    { field: 'paymentMethod', value: '', path: 'paymentMethod' },
    { field: 'receiptStatus', value: '', path: 'receiptStatus' },
  ])('rejects invalid sale field $field', ({ field, value, path }) => {
    expectInvalidPath(
      stockMovementSchema.safeParse(makeSaleInput({ [field]: value })),
      path,
    )
  })

  it('rejects a received sale when amount received differs from total', () => {
    expectInvalidPath(
      stockMovementSchema.safeParse(makeSaleInput({ amountReceived: '100' })),
      'amountReceived',
    )
  })

  it('rejects a pending sale with amount received greater than zero', () => {
    expectInvalidPath(
      stockMovementSchema.safeParse(
        makeSaleInput({
          amountReceived: '1',
          receiptStatus: 'pending',
        }),
      ),
      'amountReceived',
    )
  })

  it('accepts a pending sale with amount received equal to zero', () => {
    const result = stockMovementSchema.safeParse(
      makeSaleInput({
        amountReceived: '0',
        receiptStatus: 'pending',
      }),
    )

    expect(result.success).toBe(true)
  })

  it.each(['0', '198'])(
    'rejects a partial sale with amount received %s',
    (amountReceived) => {
      expectInvalidPath(
        stockMovementSchema.safeParse(
          makeSaleInput({
            amountReceived,
            receiptStatus: 'partial',
          }),
        ),
        'amountReceived',
      )
    },
  )

  it('accepts a partial sale with amount received between zero and total', () => {
    const result = stockMovementSchema.safeParse(
      makeSaleInput({
        amountReceived: '100',
        receiptStatus: 'partial',
      }),
    )

    expect(result.success).toBe(true)
  })

  it('rejects adjustment without a non-zero signed delta', () => {
    expectInvalidPath(
      stockMovementSchema.safeParse({
        adjustmentDelta: '0',
        currentStock: '3',
        productId: 'product-1',
        quantity: '',
        type: 'adjustment',
      }),
      'adjustmentDelta',
    )
  })

  it('rejects invalid operational date', () => {
    expectInvalidPath(
      stockMovementSchema.safeParse(
        makeSaleInput({ occurredAt: 'not-a-date' }),
      ),
      'occurredAt',
    )
  })
})
