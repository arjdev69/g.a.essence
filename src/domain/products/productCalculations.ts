import type { StockMovementType } from './product.types'

export function assertIntegerQuantity(quantity: number) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('A quantidade deve ser um inteiro maior que zero.')
  }
}

export function calculateStockDelta(
  movementType: StockMovementType,
  quantity: number,
  adjustmentDelta?: number,
) {
  assertIntegerQuantity(quantity)

  if (movementType === 'adjustment') {
    if (
      adjustmentDelta === undefined ||
      adjustmentDelta === 0 ||
      !Number.isInteger(adjustmentDelta)
    ) {
      throw new Error('O ajuste precisa de uma alteracao de estoque.')
    }

    return adjustmentDelta
  }

  if (movementType === 'purchase') {
    return quantity
  }

  if (
    movementType === 'sale' ||
    movementType === 'internal_use' ||
    movementType === 'loss'
  ) {
    return -quantity
  }

  throw new Error('Tipo de movimentacao invalido.')
}

export function calculateStockAfterMovement(
  currentStock: number,
  stockDelta: number,
) {
  const nextStock = currentStock + stockDelta

  if (nextStock < 0) {
    throw new Error('Estoque insuficiente para a movimentacao.')
  }

  return nextStock
}

export function calculateInventoryValue(
  currentStock: number,
  averageCost: number | null,
) {
  if (averageCost === null) {
    return null
  }

  return Number((currentStock * averageCost).toFixed(2))
}

export function calculateSaleResult(
  quantity: number,
  unitSalePrice: number,
  unitCost: number,
) {
  assertIntegerQuantity(quantity)

  if (unitSalePrice <= 0) {
    throw new Error('Venda exige preco unitario maior que zero.')
  }

  if (unitCost < 0) {
    throw new Error('Custo unitario nao pode ser negativo.')
  }

  const revenueValue = Number((quantity * unitSalePrice).toFixed(2))
  const costValue = Number((quantity * unitCost).toFixed(2))
  const grossProfitValue = Number((revenueValue - costValue).toFixed(2))

  return { revenueValue, costValue, grossProfitValue }
}

export function calculateWeightedAverageCost(input: {
  currentStock: number
  currentAverageCost: number | null
  incomingQuantity: number
  incomingUnitCost: number
}) {
  assertIntegerQuantity(input.incomingQuantity)

  if (input.incomingUnitCost < 0) {
    throw new Error('Custo de entrada nao pode ser negativo.')
  }

  if (input.currentAverageCost === null) {
    return Number(input.incomingUnitCost.toFixed(2))
  }

  const currentTotal = input.currentStock * input.currentAverageCost
  const incomingTotal = input.incomingQuantity * input.incomingUnitCost
  const nextStock = input.currentStock + input.incomingQuantity

  if (nextStock <= 0) {
    return 0
  }

  return Number(((currentTotal + incomingTotal) / nextStock).toFixed(2))
}

export function isLowStock(currentStock: number, minimumStock: number) {
  return currentStock <= minimumStock
}

export function normalizeProductName(name: string) {
  return name.trim().replace(/\s+/g, ' ').toLowerCase()
}

export function normalizeProductSize(size: string) {
  return size.trim().replace(/\s+/g, '').toLowerCase()
}
