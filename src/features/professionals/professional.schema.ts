import { z } from 'zod'

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

const percentageSchema = z.preprocess(
  (value) => {
    if (typeof value === 'string') {
      const trimmedValue = value.trim()

      return trimmedValue.length > 0 ? Number(trimmedValue) : undefined
    }

    return value
  },
  z
    .number('Informe o percentual padrao.')
    .min(0, 'O percentual nao pode ser menor que 0.')
    .max(100, 'O percentual nao pode ser maior que 100.')
    .default(30),
)

export const professionalSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do profissional.'),
  phone: optionalTextSchema,
  specialty: optionalTextSchema,
  pixKey: optionalTextSchema,
  defaultClinicFeePercentage: percentageSchema,
  active: z.boolean().default(true),
})

export type ProfessionalFormInput = z.input<typeof professionalSchema>
export type ProfessionalFormData = z.output<typeof professionalSchema>
