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

const optionalDateSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return value
    }

    return value.length > 0 ? value : null
  },
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data valida.')
    .nullable()
    .optional(),
)

export const patientSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do paciente.'),
  phone: optionalTextSchema,
  birthDate: optionalDateSchema,
  notes: optionalTextSchema,
  active: z.boolean().default(true),
})

export type PatientFormInput = z.input<typeof patientSchema>
export type PatientFormData = z.output<typeof patientSchema>
