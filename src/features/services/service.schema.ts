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

export const serviceSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do servico.'),
  defaultValue: numberFromInputSchema(
    z.number().min(0, 'O valor nao pode ser negativo.'),
  ).default(0),
  durationMinutes: numberFromInputSchema(
    z.number().min(1, 'A duracao deve ser maior que zero.'),
  ).default(60),
  clinicFeePercentage: numberFromInputSchema(
    z
      .number()
      .min(0, 'O percentual nao pode ser menor que 0.')
      .max(100, 'O percentual nao pode ser maior que 100.'),
  ).default(30),
  active: z.boolean().default(true),
})

export type ServiceFormInput = z.input<typeof serviceSchema>
export type ServiceFormData = z.output<typeof serviceSchema>
