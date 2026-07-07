import { z, type ZodNumber } from 'zod'
import type {
  PaymentMethod,
  ProductStatus,
  ReceiptStatus,
  StockMovementType,
} from '../../domain/products/product.types'

const stockMovementTypes = [
  'purchase',
  'sale',
  'internal_use',
  'loss',
  'adjustment',
] as const satisfies readonly StockMovementType[]

const paymentMethods = ['pix', 'card', 'cash'] as const satisfies readonly PaymentMethod[]

const productStatuses = [
  'active',
  'inactive',
] as const satisfies readonly ProductStatus[]

const receiptStatuses = [
  'received',
  'pending',
  'partial',
] as const satisfies readonly ReceiptStatus[]

function numberFromInputSchema(schema: ZodNumber) {
  return z.preprocess((value) => {
    if (typeof value === 'string') {
      const trimmedValue = value.trim()

      return trimmedValue.length > 0 ? Number(trimmedValue) : undefined
    }

    return value
  }, schema)
}

function nullableNumberFromInputSchema(schema: ZodNumber) {
  return z.preprocess((value) => {
    if (typeof value === 'string') {
      const trimmedValue = value.trim()

      return trimmedValue.length > 0 ? Number(trimmedValue) : null
    }

    return value ?? null
  }, schema.nullable())
}

const nullablePaymentMethodSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    const trimmedValue = value.trim()

    return trimmedValue.length > 0 ? trimmedValue : null
  }

  return value ?? null
}, z.enum(paymentMethods).nullable())

const nullableReceiptStatusSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    const trimmedValue = value.trim()

    return trimmedValue.length > 0 ? trimmedValue : null
  }

  return value ?? null
}, z.enum(receiptStatuses).nullable())

const optionalDateTimeSchema = z.preprocess(
  (value) => {
    if (typeof value === 'string') {
      const trimmedValue = value.trim()

      return trimmedValue.length > 0 ? trimmedValue : undefined
    }

    return value ?? undefined
  },
  z
    .string()
    .refine(
      (value) => !Number.isNaN(Date.parse(value)),
      'Informe uma data operacional valida.',
    )
    .optional(),
)

const optionalTextSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return value
    }

    const trimmedValue = value.trim()

    return trimmedValue.length > 0 ? trimmedValue : null
  },
  z.string().nullable().optional(),
)

const quantitySchema = nullableNumberFromInputSchema(
  z
    .number()
    .int('A quantidade deve ser um inteiro.')
    .min(1, 'A quantidade deve ser maior que zero.'),
)

const adjustmentDeltaSchema = nullableNumberFromInputSchema(
  z.number().int('O ajuste deve ser um inteiro.'),
)

const moneySchema = z.number().min(0, 'O valor nao pode ser negativo.')

function roundCurrency(value: number) {
  return Number(value.toFixed(2))
}

export const stockMovementSchema = z
  .object({
    productId: z.string().trim().min(1, 'Selecione um produto.'),
    productStatus: z.enum(productStatuses).default('active'),
    currentStock: nullableNumberFromInputSchema(
      z
        .number()
        .int('O saldo atual deve ser um inteiro.')
        .min(0, 'O saldo atual nao pode ser negativo.'),
    ).optional(),
    averageCost: nullableNumberFromInputSchema(
      z.number().min(0, 'O custo medio nao pode ser negativo.'),
    ).optional(),
    type: z.enum(stockMovementTypes),
    quantity: quantitySchema,
    adjustmentDelta: adjustmentDeltaSchema,
    unitCost: nullableNumberFromInputSchema(
      z.number().min(0, 'O custo unitario nao pode ser negativo.'),
    ),
    unitSalePrice: nullableNumberFromInputSchema(
      z.number().min(0, 'O preco unitario nao pode ser negativo.'),
    ),
    paymentMethod: nullablePaymentMethodSchema,
    receiptStatus: nullableReceiptStatusSchema,
    amountReceived: numberFromInputSchema(moneySchema).default(0),
    occurredAt: optionalDateTimeSchema,
    notes: optionalTextSchema,
  })
  .superRefine((movement, context) => {
    if (movement.productStatus !== 'active') {
      context.addIssue({
        code: 'custom',
        message: 'Produto inativo nao pode receber movimentacao.',
        path: ['productId'],
      })
    }

    const isAdjustment = movement.type === 'adjustment'
    const stockDelta = isAdjustment
      ? movement.adjustmentDelta
      : movement.quantity === null
        ? null
        : movement.type === 'purchase'
          ? movement.quantity
          : -movement.quantity

    if (!isAdjustment && movement.quantity === null) {
      context.addIssue({
        code: 'custom',
        message: 'Informe a quantidade.',
        path: ['quantity'],
      })
    }

    if (isAdjustment) {
      if (movement.adjustmentDelta === null || movement.adjustmentDelta === 0) {
        context.addIssue({
          code: 'custom',
          message: 'O ajuste precisa de uma alteracao de estoque.',
          path: ['adjustmentDelta'],
        })
      }
    }

    if (
      stockDelta !== null &&
      stockDelta < 0 &&
      typeof movement.currentStock !== 'number'
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Informe o saldo atual do produto.',
        path: ['currentStock'],
      })
    }

    if (
      stockDelta !== null &&
      typeof movement.currentStock === 'number' &&
      movement.currentStock + stockDelta < 0
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Estoque insuficiente para a movimentacao.',
        path: isAdjustment ? ['adjustmentDelta'] : ['quantity'],
      })
    }

    if (movement.type === 'sale') {
      if (movement.averageCost === null || movement.averageCost === undefined) {
        context.addIssue({
          code: 'custom',
          message: 'Venda exige custo medio definido.',
          path: ['averageCost'],
        })
      }

      if (movement.unitSalePrice === null || movement.unitSalePrice <= 0) {
        context.addIssue({
          code: 'custom',
          message: 'Venda exige preco unitario maior que zero.',
          path: ['unitSalePrice'],
        })
      }

      if (movement.paymentMethod === null) {
        context.addIssue({
          code: 'custom',
          message: 'Venda exige forma de pagamento.',
          path: ['paymentMethod'],
        })
      }

      if (movement.receiptStatus === null) {
        context.addIssue({
          code: 'custom',
          message: 'Venda exige status de recebimento.',
          path: ['receiptStatus'],
        })
      }

      if (movement.quantity !== null && movement.unitSalePrice !== null) {
        const saleTotal = roundCurrency(
          movement.quantity * movement.unitSalePrice,
        )

        if (
          movement.receiptStatus === 'received' &&
          movement.amountReceived !== saleTotal
        ) {
          context.addIssue({
            code: 'custom',
            message: 'Venda recebida deve ter valor recebido igual ao total.',
            path: ['amountReceived'],
          })
        }

        if (
          movement.receiptStatus === 'pending' &&
          movement.amountReceived !== 0
        ) {
          context.addIssue({
            code: 'custom',
            message: 'Venda pendente deve ter valor recebido igual a zero.',
            path: ['amountReceived'],
          })
        }

        if (
          movement.receiptStatus === 'partial' &&
          (movement.amountReceived <= 0 || movement.amountReceived >= saleTotal)
        ) {
          context.addIssue({
            code: 'custom',
            message:
              'Venda parcial deve ter valor recebido maior que zero e menor que o total.',
            path: ['amountReceived'],
          })
        }

        if (movement.amountReceived > saleTotal) {
          context.addIssue({
            code: 'custom',
            message: 'O valor recebido nao pode ser maior que o total da venda.',
            path: ['amountReceived'],
          })
        }
      }
    }
  })
  .transform(
    ({
      averageCost,
      currentStock,
      productStatus,
      ...movement
    }) => {
      void averageCost
      void currentStock
      void productStatus

      if (movement.type === 'adjustment') {
        return {
          ...movement,
          amountReceived: 0,
          paymentMethod: null,
          quantity: Math.abs(movement.adjustmentDelta ?? 0),
          receiptStatus: null,
          unitCost: null,
          unitSalePrice: null,
        }
      }

      if (movement.type === 'sale') {
        return {
          ...movement,
          adjustmentDelta: undefined,
          quantity: movement.quantity ?? 0,
          unitCost: null,
        }
      }

      return {
        ...movement,
        adjustmentDelta: undefined,
        amountReceived: 0,
        paymentMethod: null,
        quantity: movement.quantity ?? 0,
        receiptStatus: null,
        unitCost: movement.type === 'purchase' ? movement.unitCost : null,
        unitSalePrice: null,
      }
    },
  )

export type StockMovementFormInput = z.input<typeof stockMovementSchema>
export type StockMovementFormData = z.output<typeof stockMovementSchema>
