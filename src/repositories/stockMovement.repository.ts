import type {
  CreateStockMovementInput,
  PaymentMethod,
  ReceiptStatus,
  StockMovementDTO,
  StockMovementFilters,
  StockMovementType,
} from '../domain/products/product.types'
import { supabaseClient } from '../services/supabase/supabaseClient'
import type { Tables } from '../services/supabase/database.types'

type StockMovementRow = Tables<'stock_movements'>

const stockMovementSelect = `
  id,
  product_id,
  type,
  quantity,
  stock_delta,
  unit_cost,
  unit_sale_price,
  revenue_value,
  cost_value,
  gross_profit_value,
  payment_method,
  receipt_status,
  amount_received,
  notes,
  occurred_at,
  created_at,
  updated_at
`

const stockMovementTypes = [
  'purchase',
  'sale',
  'internal_use',
  'loss',
  'adjustment',
] as const satisfies readonly StockMovementType[]

const paymentMethods = ['pix', 'card', 'cash'] as const satisfies readonly PaymentMethod[]

const receiptStatuses = [
  'received',
  'pending',
  'partial',
] as const satisfies readonly ReceiptStatus[]

function isStockMovementType(type: string): type is StockMovementType {
  return stockMovementTypes.includes(type as StockMovementType)
}

function isPaymentMethod(
  paymentMethod: string | null,
): paymentMethod is PaymentMethod | null {
  return (
    paymentMethod === null ||
    paymentMethods.includes(paymentMethod as PaymentMethod)
  )
}

function isReceiptStatus(
  receiptStatus: string | null,
): receiptStatus is ReceiptStatus | null {
  return (
    receiptStatus === null ||
    receiptStatuses.includes(receiptStatus as ReceiptStatus)
  )
}

function toStockMovementDTO(
  row: Omit<StockMovementRow, 'user_id'>,
): StockMovementDTO {
  if (!isStockMovementType(row.type)) {
    throw new Error(`Tipo de movimentacao invalido: ${row.type}`)
  }

  if (!isPaymentMethod(row.payment_method)) {
    throw new Error(`Forma de pagamento invalida: ${row.payment_method}`)
  }

  if (!isReceiptStatus(row.receipt_status)) {
    throw new Error(`Status de recebimento invalido: ${row.receipt_status}`)
  }

  return {
    amountReceived: row.amount_received,
    costValue: row.cost_value,
    createdAt: row.created_at,
    grossProfitValue: row.gross_profit_value,
    id: row.id,
    notes: row.notes,
    occurredAt: row.occurred_at,
    paymentMethod: row.payment_method,
    productId: row.product_id,
    quantity: row.quantity,
    receiptStatus: row.receipt_status,
    revenueValue: row.revenue_value,
    stockDelta: row.stock_delta,
    type: row.type,
    unitCost: row.unit_cost,
    unitSalePrice: row.unit_sale_price,
    updatedAt: row.updated_at,
  }
}

export const stockMovementRepository = {
  async listByProductId(productId: string): Promise<StockMovementDTO[]> {
    const { data, error } = await supabaseClient
      .from('stock_movements')
      .select(stockMovementSelect)
      .eq('product_id', productId)
      .order('occurred_at', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data.map(toStockMovementDTO)
  },

  async listRecent(
    filters: StockMovementFilters = {},
  ): Promise<StockMovementDTO[]> {
    let query = supabaseClient
      .from('stock_movements')
      .select(stockMovementSelect)
      .order('occurred_at', { ascending: false })
      .order('created_at', { ascending: false })

    if (filters.productId) {
      query = query.eq('product_id', filters.productId)
    }

    if (filters.type) {
      query = query.eq('type', filters.type)
    }

    if (filters.dateFrom) {
      query = query.gte('occurred_at', filters.dateFrom)
    }

    if (filters.dateTo) {
      query = query.lte('occurred_at', filters.dateTo)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data.map(toStockMovementDTO)
  },

  async create(input: CreateStockMovementInput): Promise<StockMovementDTO> {
    const { data, error } = await supabaseClient.rpc('create_stock_movement', {
      input_adjustment_delta: input.adjustmentDelta ?? null,
      input_amount_received: input.amountReceived ?? 0,
      input_notes: input.notes ?? null,
      input_occurred_at: input.occurredAt ?? null,
      input_payment_method: input.paymentMethod ?? null,
      input_product_id: input.productId,
      input_quantity: input.quantity,
      input_receipt_status: input.receiptStatus ?? null,
      input_type: input.type,
      input_unit_cost: input.unitCost ?? null,
      input_unit_sale_price: input.unitSalePrice ?? null,
    })

    if (error) {
      throw error
    }

    return toStockMovementDTO(data)
  },
}
