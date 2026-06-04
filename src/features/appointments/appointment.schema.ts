import { z, type ZodNumber } from 'zod'
import type { AppointmentStatus } from '../../domain/appointments/appointment.types'

const appointmentStatuses = [
  'scheduled',
  'completed',
  'cancelled',
  'no_show',
  'paid',
] as const satisfies readonly AppointmentStatus[]

function numberFromInputSchema(schema: ZodNumber) {
  return z.preprocess((value) => {
    if (typeof value === 'string') {
      const trimmedValue = value.trim()

      return trimmedValue.length > 0 ? Number(trimmedValue) : undefined
    }

    return value
  }, schema)
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

const requiredIdSchema = (message: string) =>
  z.string().trim().min(1, message)

export const appointmentSchema = z.object({
  patientId: requiredIdSchema('Selecione um paciente.'),
  professionalId: requiredIdSchema('Selecione um profissional.'),
  serviceId: requiredIdSchema('Selecione um servico.'),
  appointmentDate: z
    .string()
    .trim()
    .min(1, 'Informe a data.')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data valida.'),
  appointmentTime: z
    .string()
    .trim()
    .min(1, 'Informe a hora.')
    .regex(/^\d{2}:\d{2}$/, 'Informe uma hora valida.'),
  description: optionalTextSchema,
  notes: optionalTextSchema,
  value: numberFromInputSchema(
    z.number().min(0, 'O valor nao pode ser negativo.'),
  ).default(0),
  clinicFeePercentage: numberFromInputSchema(
    z
      .number()
      .min(0, 'O percentual nao pode ser menor que 0.')
      .max(100, 'O percentual nao pode ser maior que 100.'),
  ).default(30),
  status: z.enum(appointmentStatuses).default('scheduled'),
})

export type AppointmentFormInput = z.input<typeof appointmentSchema>
export type AppointmentFormData = z.output<typeof appointmentSchema>
