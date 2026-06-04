import type { AppointmentStatus } from './appointment.types'

export function isFinancialStatus(status: AppointmentStatus) {
  return status === 'completed' || status === 'paid'
}
