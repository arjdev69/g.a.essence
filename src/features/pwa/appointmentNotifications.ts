import type { AppointmentDTO } from '../../domain/appointments/appointment.types'

export const APPOINTMENT_NOTIFICATION_REMINDER_MINUTES = 15
export const APPOINTMENT_NOTIFICATION_PREFERENCE_EVENT =
  'agenda-ga:appointment-notifications-preference'

const ENABLED_STORAGE_KEY = 'agenda-ga.appointment-notifications.enabled'
const SENT_STORAGE_KEY = 'agenda-ga.appointment-notifications.sent'
const MAX_TIMEOUT_DELAY_MS = 2_147_483_647

export type AppointmentNotificationPermission =
  | NotificationPermission
  | 'unsupported'

type AppointmentNotificationContent = {
  body: string
  data: {
    appointmentId: string
    url: string
  }
  tag: string
  title: string
}

function isBrowserStorageAvailable() {
  return typeof window !== 'undefined' && 'localStorage' in window
}

function readStorageValue(key: string) {
  if (!isBrowserStorageAvailable()) {
    return null
  }

  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorageValue(key: string, value: string) {
  if (!isBrowserStorageAvailable()) {
    return
  }

  try {
    window.localStorage.setItem(key, value)
  } catch {
    return
  }
}

function readSentNotificationKeys(): Record<string, true> {
  const rawValue = readStorageValue(SENT_STORAGE_KEY)

  if (!rawValue) {
    return {}
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue)

    if (!parsedValue || typeof parsedValue !== 'object') {
      return {}
    }

    return parsedValue as Record<string, true>
  } catch {
    return {}
  }
}

function getDisplayTime(time: string) {
  return time.slice(0, 5)
}

export function areAppointmentNotificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getAppointmentNotificationPermission(): AppointmentNotificationPermission {
  if (!areAppointmentNotificationsSupported()) {
    return 'unsupported'
  }

  return Notification.permission
}

export function isAppointmentNotificationsEnabled() {
  return readStorageValue(ENABLED_STORAGE_KEY) === 'true'
}

export function areAppointmentNotificationsActive() {
  return (
    getAppointmentNotificationPermission() === 'granted' &&
    isAppointmentNotificationsEnabled()
  )
}

export function setAppointmentNotificationsEnabled(enabled: boolean) {
  writeStorageValue(ENABLED_STORAGE_KEY, String(enabled))

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(APPOINTMENT_NOTIFICATION_PREFERENCE_EVENT))
  }
}

export async function requestAppointmentNotificationPermission(): Promise<AppointmentNotificationPermission> {
  if (!areAppointmentNotificationsSupported()) {
    return 'unsupported'
  }

  return Notification.requestPermission()
}

export function getAppointmentDateTime(appointment: AppointmentDTO) {
  const [year, month, day] = appointment.appointmentDate
    .split('-')
    .map(Number)
  const [hour, minute] = appointment.appointmentTime.split(':').map(Number)

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    !Number.isInteger(hour) ||
    !Number.isInteger(minute)
  ) {
    return null
  }

  const date = new Date(year, month - 1, day, hour, minute, 0, 0)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute
  ) {
    return null
  }

  return date
}

export function getAppointmentReminderDate(appointment: AppointmentDTO) {
  const appointmentDate = getAppointmentDateTime(appointment)

  if (!appointmentDate) {
    return null
  }

  return new Date(
    appointmentDate.getTime() -
      APPOINTMENT_NOTIFICATION_REMINDER_MINUTES * 60 * 1000,
  )
}

export function getAppointmentNotificationKey(appointment: AppointmentDTO) {
  return `${appointment.id}:${appointment.appointmentDate}:${appointment.appointmentTime}`
}

export function getAppointmentNotificationDelay(
  appointment: AppointmentDTO,
  now = new Date(),
) {
  if (appointment.status !== 'scheduled') {
    return null
  }

  const reminderDate = getAppointmentReminderDate(appointment)

  if (!reminderDate) {
    return null
  }

  const delay = reminderDate.getTime() - now.getTime()

  if (delay < 0 || delay > MAX_TIMEOUT_DELAY_MS) {
    return null
  }

  return delay
}

export function wasAppointmentNotificationSent(key: string) {
  return readSentNotificationKeys()[key] === true
}

export function markAppointmentNotificationSent(key: string) {
  const sentNotificationKeys = readSentNotificationKeys()
  sentNotificationKeys[key] = true
  writeStorageValue(SENT_STORAGE_KEY, JSON.stringify(sentNotificationKeys))
}

export function createAppointmentNotificationContent(
  appointment: AppointmentDTO,
): AppointmentNotificationContent {
  const patientName = appointment.patientName?.trim() || 'Paciente sem nome'
  const appointmentDetails = [
    appointment.serviceName?.trim(),
    appointment.professionalName?.trim(),
  ]
    .filter(Boolean)
    .join(' - ')
  const time = getDisplayTime(appointment.appointmentTime)
  const body = appointmentDetails
    ? `${patientName} - ${appointmentDetails}, as ${time}`
    : `${patientName}, as ${time}`

  return {
    body,
    data: {
      appointmentId: appointment.id,
      url: '/appointments',
    },
    tag: `appointment-reminder-${appointment.id}`,
    title: `Atendimento em ${APPOINTMENT_NOTIFICATION_REMINDER_MINUTES} minutos`,
  }
}

export async function showAppointmentNotification(appointment: AppointmentDTO) {
  if (!areAppointmentNotificationsActive()) {
    return false
  }

  const { body, data, tag, title } =
    createAppointmentNotificationContent(appointment)
  const options: NotificationOptions = {
    badge: '/favicon.svg',
    body,
    data,
    icon: '/app-icon-192.png',
    tag,
  }

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration()

    if (registration && 'showNotification' in registration) {
      await registration.showNotification(title, options)
      return true
    }
  }

  const notification = new Notification(title, options)
  notification.onclick = () => {
    window.focus()
    window.location.assign(data.url)
  }

  return true
}
