import { describe, expect, it } from 'vitest'

import type { AppointmentDTO } from '../domain/appointments'
import {
  createAppointmentCalendarIcs,
  createAppointmentIcs,
  createCalendarEvent,
  getAppointmentCalendarErrorMessage,
  prepareAppointmentCalendarInput,
} from '../domain/calendar'

function makeAppointment(
  input: Partial<AppointmentDTO> & Pick<AppointmentDTO, 'status' | 'value'>,
): AppointmentDTO {
  return {
    appointmentDate: input.appointmentDate ?? '2026-06-03',
    appointmentTime: input.appointmentTime ?? '10:15',
    clinicFeePercentage: input.clinicFeePercentage ?? 30,
    clinicFeeValue: input.clinicFeeValue ?? 33,
    createdAt: input.createdAt ?? '2026-06-01T12:00:00Z',
    description: input.description ?? null,
    id: input.id ?? 'appointment-1',
    notes: input.notes ?? 'Primeira linha\nSegunda linha',
    patientId: input.patientId ?? 'patient-1',
    patientName: input.patientName ?? 'Maria, Silva',
    professionalGainValue: input.professionalGainValue ?? 77,
    professionalId: input.professionalId ?? 'professional-1',
    professionalName: input.professionalName ?? 'Dra. Ana',
    serviceId: input.serviceId ?? 'service-1',
    serviceName: input.serviceName ?? 'Consulta; inicial',
    status: input.status,
    updatedAt: input.updatedAt ?? '2026-06-01T12:00:00Z',
    value: input.value,
  }
}

describe('calendar export', () => {
  const baseAppointment = makeAppointment({
    status: 'completed',
    value: 110,
  })
  const basePrepared = prepareAppointmentCalendarInput(baseAppointment)

  if (!basePrepared.ok) {
    throw new Error(basePrepared.errorMessage)
  }

  it('creates a calendar event using the appointment duration when present', () => {
    const event = createCalendarEvent({
      ...basePrepared.input,
      durationMinutes: 45,
    })

    expect(event).toEqual({
      appointmentId: 'appointment-1',
      description:
        'Profissional: Dra. Ana\nServico: Consulta; inicial\nValor: R$ 110,00\nStatus: completed\nObservacoes: Primeira linha\nSegunda linha',
      durationMinutes: 45,
      endDate: '2026-06-03',
      endTime: '11:00',
      startDate: '2026-06-03',
      startTime: '10:15',
      timeZone: 'local',
      title: 'Atendimento - Maria, Silva - Consulta; inicial',
    })
  })

  it('maps a saved appointment into a validated export input', () => {
    const validation = prepareAppointmentCalendarInput(baseAppointment)

    expect(validation).toEqual({
      input: {
        appointmentDate: '2026-06-03',
        appointmentTime: '10:15',
        durationMinutes: undefined,
        id: 'appointment-1',
        notes: 'Primeira linha\nSegunda linha',
        patientName: 'Maria, Silva',
        professionalName: 'Dra. Ana',
        serviceName: 'Consulta; inicial',
        status: 'completed',
        timeZone: undefined,
        value: 110,
      },
      ok: true,
    })
  })

  it('normalizes appointment times that include seconds', () => {
    const validation = prepareAppointmentCalendarInput(
      makeAppointment({
        appointmentTime: '14:00:00',
        status: 'completed',
        value: 110,
      }),
    )

    expect(validation.ok).toBe(true)
    if (!validation.ok) {
      throw new Error(validation.errorMessage)
    }

    expect(validation.input.appointmentTime).toBe('14:00')
  })

  it('blocks export when appointment data is incomplete', () => {
    const incompleteAppointment = makeAppointment({
      patientName: '',
      status: 'completed',
      value: 110,
    })

    const errorMessage = getAppointmentCalendarErrorMessage(
      incompleteAppointment,
    )

    expect(errorMessage).toBe(
      'Nao foi possivel gerar o arquivo. Dados do atendimento incompletos.',
    )
    expect(() =>
      createAppointmentCalendarIcs(incompleteAppointment),
    ).toThrow(
      'Nao foi possivel gerar o arquivo. Dados do atendimento incompletos.',
    )
  })

  it('creates an ICS file with escaped text, timestamps and a predictable filename', () => {
    const file = createAppointmentIcs(
      {
        ...basePrepared.input,
        durationMinutes: undefined,
      },
      { now: new Date('2026-06-01T12:00:00') },
    )

    expect(file.filename).toBe('atendimento-2026-06-03-10-15.ics')
    expect(file.content).toContain('BEGIN:VCALENDAR')
    expect(file.content).toContain('BEGIN:VEVENT')
    expect(file.content).toContain(
      'SUMMARY:Atendimento - Maria\\, Silva - Consulta\\; inicial',
    )
    expect(file.content).toContain(
      'DESCRIPTION:Profissional: Dra. Ana\\nServico: Consulta\\; inicial\\nValor: R$ 110\\,00\\nStatus: completed\\nObservacoes: Primeira linha\\nSegunda linha',
    )
    expect(file.content).toContain('DTSTAMP:20260601T120000')
    expect(file.content).toContain('DTSTART:20260603T101500')
    expect(file.content).toContain('DTEND:20260603T111500')
    expect(file.content.endsWith('\r\n')).toBe(true)
  })
})
