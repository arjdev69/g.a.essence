import type { AppointmentStatus } from '../appointments/appointment.types'

export const CALENDAR_DEFAULT_DURATION_MINUTES = 60

export const CALENDAR_TIME_ZONE_MODE_LOCAL = 'local' as const

export type CalendarTimeZone =
  | typeof CALENDAR_TIME_ZONE_MODE_LOCAL
  | string

export type CalendarAppointmentInput = {
  id: string
  patientName: string
  professionalName: string
  serviceName: string
  appointmentDate: string
  appointmentTime: string
  value: number
  notes?: string | null
  status: AppointmentStatus
  durationMinutes?: number | null
  timeZone?: CalendarTimeZone | null
}

export type CalendarEvent = {
  appointmentId: string
  title: string
  description: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  durationMinutes: number
  timeZone: CalendarTimeZone
}

export type CalendarIcsFile = {
  filename: string
  content: string
}
