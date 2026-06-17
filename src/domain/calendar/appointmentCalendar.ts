import type { AppointmentDTO } from '../appointments/appointment.types'
import { formatCurrencyBRL } from '../../utils/formatCurrencyBRL'
import {
  createAppointmentIcs,
} from './createAppointmentIcs'
import type {
  CalendarAppointmentInput,
  CalendarIcsFile,
} from './calendar.types'

export type AppointmentCalendarValidation =
  | {
      ok: true
      input: CalendarAppointmentInput
    }
  | {
      ok: false
      errorMessage: string
    }

const calendarValidationErrorMessage =
  'Nao foi possivel gerar o arquivo. Dados do atendimento incompletos.'

function hasText(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function isTimeKey(value: string) {
  return /^\d{2}:\d{2}(:\d{2})?$/.test(value)
}

function normalizeTimeKey(value: string) {
  return value.slice(0, 5)
}

export function prepareAppointmentCalendarInput(
  appointment: AppointmentDTO,
): AppointmentCalendarValidation {
  if (!hasText(appointment.id)) {
    return { errorMessage: calendarValidationErrorMessage, ok: false }
  }

  if (!hasText(appointment.patientName)) {
    return { errorMessage: calendarValidationErrorMessage, ok: false }
  }

  if (!hasText(appointment.professionalName)) {
    return { errorMessage: calendarValidationErrorMessage, ok: false }
  }

  if (!hasText(appointment.serviceName)) {
    return { errorMessage: calendarValidationErrorMessage, ok: false }
  }

  if (!isDateKey(appointment.appointmentDate)) {
    return { errorMessage: calendarValidationErrorMessage, ok: false }
  }

  if (!isTimeKey(appointment.appointmentTime)) {
    return { errorMessage: calendarValidationErrorMessage, ok: false }
  }

  if (!Number.isFinite(appointment.value)) {
    return { errorMessage: calendarValidationErrorMessage, ok: false }
  }

  const patientName = appointment.patientName.trim()
  const professionalName = appointment.professionalName.trim()
  const serviceName = appointment.serviceName.trim()
  const appointmentTime = normalizeTimeKey(appointment.appointmentTime)

  return {
    input: {
      appointmentDate: appointment.appointmentDate,
      appointmentTime,
      durationMinutes: undefined,
      id: appointment.id,
      notes: appointment.notes,
      patientName,
      professionalName,
      serviceName,
      status: appointment.status,
      timeZone: undefined,
      value: appointment.value,
    },
    ok: true,
  }
}

export function createAppointmentCalendarIcs(
  appointment: AppointmentDTO,
  options?: { now?: Date },
): CalendarIcsFile {
  const prepared = prepareAppointmentCalendarInput(appointment)

  if (!prepared.ok) {
    throw new Error(prepared.errorMessage)
  }

  return createAppointmentIcs(prepared.input, options)
}

export function getAppointmentCalendarErrorMessage(
  appointment: AppointmentDTO,
) {
  const prepared = prepareAppointmentCalendarInput(appointment)

  return prepared.ok ? null : prepared.errorMessage
}

export function getAppointmentCalendarTitle(appointment: AppointmentDTO) {
  const patientName = hasText(appointment.patientName)
    ? appointment.patientName.trim()
    : 'atendimento'
  const serviceName = hasText(appointment.serviceName)
    ? appointment.serviceName.trim()
    : 'servico'

  return `Atendimento - ${patientName} - ${serviceName}`
}

export function getAppointmentCalendarDescription(appointment: AppointmentDTO) {
  const lines = [
    `Profissional: ${hasText(appointment.professionalName) ? appointment.professionalName.trim() : '-'}`,
    `Servico: ${hasText(appointment.serviceName) ? appointment.serviceName.trim() : '-'}`,
    `Valor: ${formatCurrencyBRL(appointment.value)}`,
    `Status: ${appointment.status}`,
  ]

  if (hasText(appointment.notes)) {
    lines.push(`Observacoes: ${appointment.notes.trim()}`)
  }

  return lines.join('\n')
}
