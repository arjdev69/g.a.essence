import { useEffect, useState } from 'react'
import {
  APPOINTMENT_NOTIFICATION_PREFERENCE_EVENT,
  getAppointmentNotificationPermission,
  isAppointmentNotificationsEnabled,
} from './appointmentNotifications'

function getPreferenceSnapshot() {
  return {
    enabled: isAppointmentNotificationsEnabled(),
    permission: getAppointmentNotificationPermission(),
  }
}

export function useAppointmentNotificationPreference() {
  const [snapshot, setSnapshot] = useState(getPreferenceSnapshot)

  useEffect(() => {
    function syncSnapshot() {
      setSnapshot(getPreferenceSnapshot())
    }

    window.addEventListener(
      APPOINTMENT_NOTIFICATION_PREFERENCE_EVENT,
      syncSnapshot,
    )
    window.addEventListener('storage', syncSnapshot)
    document.addEventListener('visibilitychange', syncSnapshot)

    return () => {
      window.removeEventListener(
        APPOINTMENT_NOTIFICATION_PREFERENCE_EVENT,
        syncSnapshot,
      )
      window.removeEventListener('storage', syncSnapshot)
      document.removeEventListener('visibilitychange', syncSnapshot)
    }
  }, [])

  return snapshot
}
