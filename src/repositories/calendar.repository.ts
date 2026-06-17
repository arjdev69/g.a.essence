import type { AppointmentDTO } from '../domain/appointments/appointment.types'
import { createAppointmentCalendarIcs } from '../domain/calendar'
import { supabaseClient } from '../services/supabase/supabaseClient'

const appointmentCalendarBucket = 'appointment-calendars'

async function getRequiredUserId() {
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser()

  if (error || !user) {
    throw error ?? new Error('Usuario autenticado nao encontrado.')
  }

  return user.id
}

function buildAppointmentCalendarPath(
  userId: string,
  appointmentId: string,
) {
  return `${userId}/${appointmentId}.ics`
}

export async function uploadAppointmentCalendarFile(
  appointment: AppointmentDTO,
): Promise<string> {
  const userId = await getRequiredUserId()
  const calendarFile = createAppointmentCalendarIcs(appointment)
  const path = buildAppointmentCalendarPath(userId, appointment.id)
  const blob = new Blob([calendarFile.content], {
    type: 'text/calendar;charset=utf-8',
  })
  const { error } = await supabaseClient.storage
    .from(appointmentCalendarBucket)
    .upload(path, blob, {
      contentType: 'text/calendar;charset=utf-8',
      upsert: true,
    })

  if (error) {
    throw error
  }

  return supabaseClient.storage
    .from(appointmentCalendarBucket)
    .getPublicUrl(path).data.publicUrl
}

export async function getAppointmentCalendarPublicUrl(
  appointmentId: string,
): Promise<string> {
  const userId = await getRequiredUserId()
  const path = buildAppointmentCalendarPath(userId, appointmentId)

  return supabaseClient.storage
    .from(appointmentCalendarBucket)
    .getPublicUrl(path).data.publicUrl
}
