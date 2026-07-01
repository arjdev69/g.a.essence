import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { appointmentRepository } from '../../repositories/appointment.repository'
import {
  getAppointmentNotificationDelay,
  getAppointmentNotificationKey,
  markAppointmentNotificationSent,
  showAppointmentNotification,
  wasAppointmentNotificationSent,
} from './appointmentNotifications'
import { useAppointmentNotificationPreference } from './useAppointmentNotificationPreference'

export function AppointmentNotificationsScheduler() {
  const { enabled, permission } = useAppointmentNotificationPreference()
  const isActive = enabled && permission === 'granted'
  const { data: appointments = [] } = useQuery({
    enabled: isActive,
    queryFn: () => appointmentRepository.list({ status: 'scheduled' }),
    queryKey: ['appointments', { notifications: true, status: 'scheduled' }],
    refetchInterval: isActive ? 60_000 : false,
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    if (!isActive || appointments.length === 0) {
      return
    }

    const now = new Date()
    const timeoutIds: number[] = []

    for (const appointment of appointments) {
      const notificationKey = getAppointmentNotificationKey(appointment)

      if (wasAppointmentNotificationSent(notificationKey)) {
        continue
      }

      const delay = getAppointmentNotificationDelay(appointment, now)

      if (delay === null) {
        continue
      }

      const timeoutId = window.setTimeout(() => {
        if (wasAppointmentNotificationSent(notificationKey)) {
          return
        }

        markAppointmentNotificationSent(notificationKey)
        void showAppointmentNotification(appointment)
      }, delay)

      timeoutIds.push(timeoutId)
    }

    return () => {
      for (const timeoutId of timeoutIds) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [appointments, isActive])

  return null
}
