import type {
  ProductSalesSummaryDTO,
  ProductSummaryFilters,
} from '../domain/products/product.types'
import { supabaseClient } from '../services/supabase/supabaseClient'
import type { Tables } from '../services/supabase/database.types'

type StockMovementRow = Tables<'stock_movements'>

type StockMovementSalesSummaryRow = Pick<
  StockMovementRow,
  | 'product_id'
  | 'quantity'
  | 'revenue_value'
  | 'cost_value'
  | 'gross_profit_value'
  | 'amount_received'
  | 'occurred_at'
> & {
  products: {
    name: string
    size: string
  } | null
}

function addMoney(total: number, value: number) {
  return Number((total + value).toFixed(2))
}

export const productSalesSummaryRepository = {
  async getByProduct(
    filters: ProductSummaryFilters = {},
  ): Promise<ProductSalesSummaryDTO[]> {
    let query = supabaseClient
      .from('stock_movements')
      .select(
        `
          product_id,
          quantity,
          revenue_value,
          cost_value,
          gross_profit_value,
          amount_received,
          occurred_at,
          products(name, size)
        `,
      )
      .eq('type', 'sale')
      .order('occurred_at', { ascending: false })

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

    const rows = data as StockMovementSalesSummaryRow[]
    const summaryByProduct = new Map<string, ProductSalesSummaryDTO>()

    for (const row of rows) {
      if (!row.products) {
        throw new Error(
          `Produto relacionado nao encontrado para resumo: ${row.product_id}`,
        )
      }

      const current = summaryByProduct.get(row.product_id) ?? {
        amountReceived: 0,
        costValue: 0,
        grossProfitValue: 0,
        productId: row.product_id,
        productName: row.products.name,
        productSize: row.products.size,
        revenueValue: 0,
        soldQuantity: 0,
      }

      current.soldQuantity += row.quantity
      current.revenueValue = addMoney(current.revenueValue, row.revenue_value)
      current.costValue = addMoney(current.costValue, row.cost_value)
      current.grossProfitValue = addMoney(
        current.grossProfitValue,
        row.gross_profit_value,
      )
      current.amountReceived = addMoney(current.amountReceived, row.amount_received)

      summaryByProduct.set(row.product_id, current)
    }

    return [...summaryByProduct.values()].sort((left, right) => {
      if (left.productName === right.productName) {
        return left.productSize.localeCompare(right.productSize)
      }

      return left.productName.localeCompare(right.productName)
    })
  },
}
