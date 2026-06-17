import { formatCurrencyBRL } from '../../utils/formatCurrencyBRL'
import {
  CALENDAR_DEFAULT_DURATION_MINUTES,
  CALENDAR_TIME_ZONE_MODE_LOCAL,
  type CalendarAppointmentInput,
  type CalendarEvent,
  type CalendarIcsFile,
} from './calendar.types'

type CreateAppointmentIcsOptions = {
  now?: Date
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function normalizeDateTime(input: string, fallbackTime = '00:00') {
  const [datePart, timePart = fallbackTime] = input.split('T')
  const normalizedTime = timePart.length === 5 ? `${timePart}:00` : timePart

  return new Date(`${datePart}T${normalizedTime}`)
}

function formatIcsDateTime(date: Date) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('') + `T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
}

function createAppointmentTitle(input: CalendarAppointmentInput) {
  return `Atendimento - ${input.patientName} - ${input.serviceName}`
}

function createAppointmentDescription(input: CalendarAppointmentInput) {
  const descriptionLines = [
    `Profissional: ${input.professionalName}`,
    `Servico: ${input.serviceName}`,
    `Valor: ${formatCurrencyBRL(input.value)}`,
    `Status: ${input.status}`,
  ]

  if (input.notes?.trim()) {
    descriptionLines.push(`Observacoes: ${input.notes.trim()}`)
  }

  return descriptionLines.join('\n')
}

function resolveDurationMinutes(input: CalendarAppointmentInput) {
  return input.durationMinutes ?? CALENDAR_DEFAULT_DURATION_MINUTES
}

function resolveTimeZone(input: CalendarAppointmentInput) {
  return input.timeZone ?? CALENDAR_TIME_ZONE_MODE_LOCAL
}

export function createCalendarEvent(
  input: CalendarAppointmentInput,
): CalendarEvent {
  const durationMinutes = resolveDurationMinutes(input)
  const start = normalizeDateTime(
    `${input.appointmentDate}T${input.appointmentTime}`,
  )
  const end = new Date(start.getTime() + durationMinutes * 60_000)
  const timeZone = resolveTimeZone(input)

  return {
    appointmentId: input.id,
    description: createAppointmentDescription(input),
    durationMinutes,
    endDate: [
      end.getFullYear(),
      pad(end.getMonth() + 1),
      pad(end.getDate()),
    ].join('-'),
    endTime: [pad(end.getHours()), pad(end.getMinutes())].join(':'),
    startDate: input.appointmentDate,
    startTime: input.appointmentTime,
    timeZone,
    title: createAppointmentTitle(input),
  }
}

export function createAppointmentIcs(
  input: CalendarAppointmentInput,
  options: CreateAppointmentIcsOptions = {},
): CalendarIcsFile {
  const event = createCalendarEvent(input)
  const start = normalizeDateTime(
    `${event.startDate}T${event.startTime}`,
  )
  const end = normalizeDateTime(`${event.endDate}T${event.endTime}`)
  const dtstamp = options.now ?? new Date()
  const filename = `atendimento-${event.startDate}-${event.startTime.replace(':', '-')}.ics`
  const uid = `${event.appointmentId}@agenda-ga`

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AgendaGA//Calendario//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(uid)}`,
    `DTSTAMP:${formatIcsDateTime(dtstamp)}`,
    `DTSTART:${formatIcsDateTime(start)}`,
    `DTEND:${formatIcsDateTime(end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return {
    content: `${lines.join('\r\n')}\r\n`,
    filename,
  }
}
