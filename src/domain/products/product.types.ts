export type ProductStatus = 'active' | 'inactive'

export type StockMovementType =
  | 'purchase'
  | 'sale'
  | 'internal_use'
  | 'loss'
  | 'adjustment'

export type PaymentMethod = 'pix' | 'card' | 'cash'

export type ReceiptStatus = 'received' | 'pending' | 'partial'

export type Product = {
  id: string
  userId: string
  name: string
  size: string
  imageUrl?: string | null
  internalCode?: string | null
  category?: string | null
  unit: string
  currentStock: number
  minimumStock: number
  averageCost: number | null
  salePrice: number | null
  salePriceOpen: boolean
  notes?: string | null
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export type ProductDTO = {
  id: string
  name: string
  size: string
  imageUrl: string | null
  internalCode: string | null
  category: string | null
  unit: string
  currentStock: number
  minimumStock: number
  averageCost: number | null
  salePrice: number | null
  salePriceOpen: boolean
  notes: string | null
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export type CreateProductInput = {
  name: string
  size: string
  imageUrl?: string | null
  internalCode?: string | null
  category?: string | null
  unit: string
  minimumStock: number
  averageCost?: number | null
  salePrice?: number | null
  salePriceOpen: boolean
  notes?: string | null
}

export type UpdateProductInput = Partial<CreateProductInput> & {
  status?: ProductStatus
}

export type ProductFilters = {
  search?: string
  category?: string
  status?: ProductStatus | 'all'
  lowStock?: boolean
  pendingData?: boolean
  paymentPending?: boolean
}

export type ProductSummaryFilters = {
  dateFrom?: string
  dateTo?: string
}

export type PaymentMethodTotals = {
  pix: number
  card: number
  cash: number
}

export type ProductSummaryDTO = {
  activeProductsCount: number
  lowStockCount: number
  zeroStockCount: number
  pendingDataCount: number
  inventoryValue: number
  periodRevenue: number
  periodGrossProfit: number
  periodReceived: number
  receivedByPaymentMethod: PaymentMethodTotals
}

export type ProductSalesSummaryDTO = {
  productId: string
  productName: string
  productSize: string
  soldQuantity: number
  revenueValue: number
  costValue: number
  grossProfitValue: number
  amountReceived: number
}

export type StockMovement = {
  id: string
  userId: string
  productId: string
  type: StockMovementType
  quantity: number
  stockDelta: number
  unitCost: number | null
  unitSalePrice: number | null
  revenueValue: number
  costValue: number
  grossProfitValue: number
  paymentMethod: PaymentMethod | null
  receiptStatus: ReceiptStatus | null
  amountReceived: number
  notes?: string | null
  occurredAt: string
  createdAt: string
  updatedAt: string
}

export type StockMovementDTO = {
  id: string
  productId: string
  type: StockMovementType
  quantity: number
  stockDelta: number
  unitCost: number | null
  unitSalePrice: number | null
  revenueValue: number
  costValue: number
  grossProfitValue: number
  paymentMethod: PaymentMethod | null
  receiptStatus: ReceiptStatus | null
  amountReceived: number
  notes: string | null
  occurredAt: string
  createdAt: string
  updatedAt: string
}

export type CreateStockMovementInput = {
  productId: string
  type: StockMovementType
  quantity: number
  adjustmentDelta?: number
  unitCost?: number | null
  unitSalePrice?: number | null
  paymentMethod?: PaymentMethod | null
  receiptStatus?: ReceiptStatus | null
  amountReceived?: number
  notes?: string | null
  occurredAt?: string
}

export type StockMovementFilters = {
  productId?: string
  type?: StockMovementType
  dateFrom?: string
  dateTo?: string
}
