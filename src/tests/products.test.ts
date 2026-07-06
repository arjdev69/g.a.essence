import { describe, expect, it } from 'vitest'

import {
  assertIntegerQuantity,
  calculateInventoryValue,
  calculateSaleResult,
  calculateStockAfterMovement,
  calculateStockDelta,
  calculateWeightedAverageCost,
  isLowStock,
  normalizeProductName,
  normalizeProductSize,
} from '../domain/products/productCalculations'

describe('calculateStockDelta', () => {
  it.each([
    { movementType: 'purchase' as const, quantity: 3, expected: 3 },
    { movementType: 'sale' as const, quantity: 2, expected: -2 },
    { movementType: 'internal_use' as const, quantity: 1, expected: -1 },
    { movementType: 'loss' as const, quantity: 1, expected: -1 },
    {
      adjustmentDelta: 4,
      movementType: 'adjustment' as const,
      quantity: 4,
      expected: 4,
    },
    {
      adjustmentDelta: -2,
      movementType: 'adjustment' as const,
      quantity: 2,
      expected: -2,
    },
  ])(
    'returns $expected for $movementType movement',
    ({ adjustmentDelta, movementType, quantity, expected }) => {
      expect(
        calculateStockDelta(movementType, quantity, adjustmentDelta),
      ).toBe(expected)
    },
  )

  it('rejects adjustment without a non-zero integer delta', () => {
    expect(() => calculateStockDelta('adjustment', 2, 0)).toThrow(
      'O ajuste precisa de uma alteracao de estoque.',
    )
  })

  it('rejects movements with invalid quantity', () => {
    expect(() => calculateStockDelta('purchase', 0)).toThrow(
      'A quantidade deve ser um inteiro maior que zero.',
    )
  })
})

describe('calculateStockAfterMovement', () => {
  it.each([
    { currentStock: 3, stockDelta: 2, expected: 5 },
    { currentStock: 3, stockDelta: -1, expected: 2 },
    { currentStock: 3, stockDelta: -3, expected: 0 },
  ])(
    'returns $expected for current stock $currentStock and delta $stockDelta',
    ({ currentStock, stockDelta, expected }) => {
      expect(calculateStockAfterMovement(currentStock, stockDelta)).toBe(
        expected,
      )
    },
  )

  it('rejects movements that would make stock negative', () => {
    expect(() => calculateStockAfterMovement(3, -4)).toThrow(
      'Estoque insuficiente para a movimentacao.',
    )
  })
})

describe('isLowStock', () => {
  it.each([
    { currentStock: 3, minimumStock: 2, expected: false },
    { currentStock: 2, minimumStock: 2, expected: true },
    { currentStock: 0, minimumStock: 2, expected: true },
  ])(
    'returns $expected for current stock $currentStock and minimum $minimumStock',
    ({ currentStock, minimumStock, expected }) => {
      expect(isLowStock(currentStock, minimumStock)).toBe(expected)
    },
  )
})

describe('calculateInventoryValue', () => {
  it.each([
    { currentStock: 3, averageCost: 198, expected: 594 },
    { currentStock: 0, averageCost: 198, expected: 0 },
    { currentStock: 1, averageCost: 112.5, expected: 112.5 },
    { currentStock: 1, averageCost: null, expected: null },
  ])(
    'returns $expected for current stock $currentStock and average cost $averageCost',
    ({ currentStock, averageCost, expected }) => {
      expect(calculateInventoryValue(currentStock, averageCost)).toBe(expected)
    },
  )
})

describe('calculateSaleResult', () => {
  it.each([
    {
      quantity: 1,
      unitSalePrice: 198,
      unitCost: 120,
      expected: { revenueValue: 198, costValue: 120, grossProfitValue: 78 },
    },
    {
      quantity: 2,
      unitSalePrice: 62,
      unitCost: 40,
      expected: { revenueValue: 124, costValue: 80, grossProfitValue: 44 },
    },
    {
      quantity: 1,
      unitSalePrice: 94.5,
      unitCost: 108,
      expected: {
        revenueValue: 94.5,
        costValue: 108,
        grossProfitValue: -13.5,
      },
    },
  ])(
    'calculates sale result for quantity $quantity and sale price $unitSalePrice',
    ({ quantity, unitSalePrice, unitCost, expected }) => {
      expect(calculateSaleResult(quantity, unitSalePrice, unitCost)).toEqual(
        expected,
      )
    },
  )

  it('rejects sale without positive unit price', () => {
    expect(() => calculateSaleResult(1, 0, 120)).toThrow(
      'Venda exige preco unitario maior que zero.',
    )
  })

  it('rejects decimal quantity', () => {
    expect(() => calculateSaleResult(1.5, 198, 120)).toThrow(
      'A quantidade deve ser um inteiro maior que zero.',
    )
  })
})

describe('calculateWeightedAverageCost', () => {
  it.each([
    {
      input: {
        currentStock: 0,
        currentAverageCost: 0,
        incomingQuantity: 3,
        incomingUnitCost: 198,
      },
      expected: 198,
    },
    {
      input: {
        currentStock: 2,
        currentAverageCost: 100,
        incomingQuantity: 2,
        incomingUnitCost: 200,
      },
      expected: 150,
    },
    {
      input: {
        currentStock: 0,
        currentAverageCost: null,
        incomingQuantity: 3,
        incomingUnitCost: 198,
      },
      expected: 198,
    },
  ])('returns weighted average cost $expected', ({ input, expected }) => {
    expect(calculateWeightedAverageCost(input)).toBe(expected)
  })

  it('rejects incoming quantity equal to zero', () => {
    expect(() =>
      calculateWeightedAverageCost({
        currentStock: 0,
        currentAverageCost: null,
        incomingQuantity: 0,
        incomingUnitCost: 198,
      }),
    ).toThrow('A quantidade deve ser um inteiro maior que zero.')
  })
})

describe('assertIntegerQuantity', () => {
  it('accepts positive integer quantities', () => {
    expect(() => assertIntegerQuantity(1)).not.toThrow()
  })

  it.each([0, -1, 1.5])('rejects invalid quantity %s', (quantity) => {
    expect(() => assertIntegerQuantity(quantity)).toThrow(
      'A quantidade deve ser um inteiro maior que zero.',
    )
  })
})

describe('product normalizers', () => {
  it('normalizes product names for logical uniqueness', () => {
    expect(normalizeProductName('  Lavanda   Extra  ')).toBe('lavanda extra')
  })

  it('normalizes product sizes for logical uniqueness', () => {
    expect(normalizeProductSize(' 5 ml ')).toBe('5ml')
  })
})
