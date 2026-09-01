import { z, type ZodNumber } from 'zod'

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

const forbiddenInitialStockSchema = z.undefined().optional()

export const productSchema = z
  .object({
    name: z.string().trim().min(1, 'Informe o nome do produto.'),
    size: z.string().trim().min(1, 'Informe o tamanho do produto.'),
    imageUrl: optionalTextSchema,
    internalCode: optionalTextSchema,
    category: optionalTextSchema,
    unit: z.string().trim().min(1, 'Informe a unidade de medida.'),
    minimumStock: numberFromInputSchema(
      z
        .number()
        .int('O estoque minimo deve ser um inteiro.')
        .min(0, 'O estoque minimo nao pode ser negativo.'),
    ).default(0),
    averageCost: nullableNumberFromInputSchema(
      z.number().min(0, 'O custo medio nao pode ser negativo.'),
    ),
    salePrice: nullableNumberFromInputSchema(
      z.number().min(0, 'O preco de venda nao pode ser negativo.'),
    ),
    salePriceOpen: z.boolean().default(true),
    notes: optionalTextSchema,
    currentStock: forbiddenInitialStockSchema,
  })
  .superRefine((product, context) => {
    if (!product.salePriceOpen && product.salePrice === null) {
      context.addIssue({
        code: 'custom',
        message: 'Informe o preco de venda ou marque preco aberto.',
        path: ['salePrice'],
      })
    }

    if (
      !product.salePriceOpen &&
      product.salePrice !== null &&
      product.salePrice <= 0
    ) {
      context.addIssue({
        code: 'custom',
        message: 'O preco de venda deve ser maior que zero.',
        path: ['salePrice'],
      })
    }
  })
  .transform(({ currentStock, ...product }) => {
    void currentStock

    if (product.salePriceOpen) {
      return { ...product, salePrice: null }
    }

    return product
  })

export type ProductFormInput = z.input<typeof productSchema>
export type ProductFormData = z.output<typeof productSchema>
