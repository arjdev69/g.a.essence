import { describe, expect, it } from 'vitest'

import type { AppointmentDTO } from '../domain/appointments/appointment.types'
import {
  createAppointmentNotificationContent,
  getAppointmentNotificationDelay,
  getAppointmentReminderDate,
} from '../features/pwa/appointmentNotifications'

function makeAppointment(input: Partial<AppointmentDTO> = {}): AppointmentDTO {
  return {
    appointmentDate: input.appointmentDate ?? '2026-06-25',
    appointmentTime: input.appointmentTime ?? '14:30:00',
    clinicFeePercentage: input.clinicFeePercentage ?? 30,
    clinicFeeValue: input.clinicFeeValue ?? 45,
    createdAt: input.createdAt ?? '2026-06-20T12:00:00Z',
    description: input.description ?? null,
    id: input.id ?? 'appointment-1',
    notes: input.notes ?? null,
    patientId: input.patientId ?? 'patient-1',
    patientName: input.patientName ?? 'Maria Silva',
    professionalGainValue: input.professionalGainValue ?? 105,
    professionalId: input.professionalId ?? 'professional-1',
    professionalName: input.professionalName ?? 'Ana Costa',
    serviceId: input.serviceId ?? 'service-1',
    serviceName: input.serviceName ?? 'Massagem relaxante',
    status: input.status ?? 'scheduled',
    updatedAt: input.updatedAt ?? '2026-06-20T12:00:00Z',
    value: input.value ?? 150,
  }
}

describe('appointment notifications', () => {
  it('calculates the reminder date 15 minutes before the appointment', () => {
    const reminderDate = getAppointmentReminderDate(makeAppointment())

    expect(reminderDate?.getFullYear()).toBe(2026)
    expect(reminderDate?.getMonth()).toBe(5)
    expect(reminderDate?.getDate()).toBe(25)
    expect(reminderDate?.getHours()).toBe(14)
    expect(reminderDate?.getMinutes()).toBe(15)
  })

  it('schedules only future appointments with scheduled status', () => {
    const now = new Date(2026, 5, 25, 14, 0, 0)

    expect(getAppointmentNotificationDelay(makeAppointment(), now)).toBe(
      15 * 60 * 1000,
    )
    expect(
      getAppointmentNotificationDelay(
        makeAppointment({ status: 'completed' }),
        now,
      ),
    ).toBeNull()
    expect(
      getAppointmentNotificationDelay(
        makeAppointment({ appointmentTime: '14:10:00' }),
        now,
      ),
    ).toBeNull()
  })

  it('creates user-facing notification content', () => {
    expect(createAppointmentNotificationContent(makeAppointment())).toEqual({
      body: 'Maria Silva - Massagem relaxante - Ana Costa, as 14:30',
      data: {
        appointmentId: 'appointment-1',
        url: '/appointments',
      },
      tag: 'appointment-reminder-appointment-1',
      title: 'Atendimento em 15 minutos',
    })
  })

  it('ignores invalid appointment date values', () => {
    expect(
      getAppointmentReminderDate(makeAppointment({ appointmentDate: '2026-02-31' })),
    ).toBeNull()
  })
})
