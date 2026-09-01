import type {
  AppointmentDTO,
  AppointmentStatus,
} from '../appointments/appointment.types'

export type MonthlyReportInput = {
  month: number
  year: number
  professionalId?: string
  serviceId?: string
  status?: AppointmentStatus
}

export type MonthlyReportOutput = {
  totalRevenue: number
  totalClinicRevenue: number
  totalProfessionalRevenue: number
  totalCount: number
  financialCount: number
  /** @deprecated Use financialCount for explicit report semantics. */
  appointmentCount: number
  cancelledCount: number
  noShowCount: number
  giftCount: number
  rows: AppointmentDTO[]
  byService: Array<{
    serviceId: string
    serviceName: string
    total: number
    count: number
  }>
  byProfessional: Array<{
    professionalId: string
    professionalName: string
    total: number
    count: number
  }>
}
