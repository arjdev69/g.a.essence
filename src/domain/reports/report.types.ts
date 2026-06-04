import type { AppointmentDTO } from '../appointments/appointment.types'

export type MonthlyReportInput = {
  month: number
  year: number
  professionalId?: string
  serviceId?: string
}

export type MonthlyReportOutput = {
  totalRevenue: number
  totalClinicRevenue: number
  totalProfessionalRevenue: number
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
