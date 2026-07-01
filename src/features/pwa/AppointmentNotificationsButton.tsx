import { Bell, BellOff } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui'
import {
  requestAppointmentNotificationPermission,
  setAppointmentNotificationsEnabled,
} from './appointmentNotifications'
import { useAppointmentNotificationPreference } from './useAppointmentNotificationPreference'

export function AppointmentNotificationsButton() {
  const { enabled, permission } = useAppointmentNotificationPreference()
  const [isRequesting, setIsRequesting] = useState(false)
  const isActive = enabled && permission === 'granted'
  const Icon = isActive ? Bell : BellOff
  const label =
    permission === 'unsupported'
      ? 'Lembretes indisponiveis'
      : isActive
        ? 'Desativar lembretes'
        : 'Ativar lembretes'

  async function handleClick() {
    if (permission === 'unsupported') {
      window.alert('Este navegador nao oferece suporte a notificacoes locais.')
      return
    }

    if (permission === 'denied') {
      window.alert(
        'As notificacoes estao bloqueadas no navegador. Libere a permissao nas configuracoes do site.',
      )
      return
    }

    if (permission !== 'granted') {
      setIsRequesting(true)

      try {
        const nextPermission = await requestAppointmentNotificationPermission()

        if (nextPermission === 'granted') {
          setAppointmentNotificationsEnabled(true)
        } else {
          setAppointmentNotificationsEnabled(false)
        }
      } finally {
        setIsRequesting(false)
      }

      return
    }

    setAppointmentNotificationsEnabled(!enabled)
  }

  return (
    <Button
      aria-label={label}
      aria-pressed={isActive}
      className="h-10 w-10 rounded-md px-0 sm:w-auto sm:px-3"
      disabled={isRequesting}
      icon={<Icon className="h-4 w-4" aria-hidden="true" />}
      onClick={handleClick}
      title={label}
      variant="secondary"
    >
      <span className="hidden sm:inline">
        {isActive ? 'Lembretes ativos' : 'Lembretes'}
      </span>
    </Button>
  )
}
