import { describe, expect, it } from 'vitest'

import type { AppointmentDTO } from '../domain/appointments'
import {
  createMonthlyReportCsv,
  createMonthlySummary,
} from '../domain/reports'

function makeAppointment(
  input: Pick<
    AppointmentDTO,
    | 'clinicFeeValue'
    | 'professionalGainValue'
    | 'status'
    | 'value'
  > &
    Partial<AppointmentDTO>,
): AppointmentDTO {
  return {
    appointmentDate: input.appointmentDate ?? '2026-06-03',
    appointmentTime: input.appointmentTime ?? '10:00',
    clinicFeePercentage: input.clinicFeePercentage ?? 30,
    clinicFeeValue: input.clinicFeeValue,
    createdAt: input.createdAt ?? '2026-06-03T10:00:00Z',
    description: input.description ?? null,
    id: input.id ?? crypto.randomUUID(),
    notes: input.notes ?? null,
    patientId: input.patientId ?? 'patient-1',
    patientName: input.patientName ?? 'Paciente',
    professionalGainValue: input.professionalGainValue,
    professionalId: input.professionalId ?? 'professional-1',
    professionalName: input.professionalName ?? 'Profissional',
    serviceId: input.serviceId ?? 'service-1',
    serviceName: input.serviceName ?? 'Servico',
    status: input.status,
    updatedAt: input.updatedAt ?? '2026-06-03T10:00:00Z',
    value: input.value,
  }
}

describe('createMonthlySummary', () => {
  it('summarizes financial appointments for the selected month', () => {
    const appointments = [
      makeAppointment({
        clinicFeeValue: 33,
        professionalGainValue: 77,
        status: 'completed',
        value: 110,
      }),
      makeAppointment({
        clinicFeeValue: 48,
        professionalGainValue: 112,
        status: 'paid',
        value: 160,
      }),
      makeAppointment({
        clinicFeeValue: 33,
        professionalGainValue: 77,
        status: 'cancelled',
        value: 110,
      }),
      makeAppointment({
        clinicFeeValue: 30,
        professionalGainValue: 70,
        status: 'no_show',
        value: 100,
      }),
      makeAppointment({
        clinicFeeValue: 0,
        professionalGainValue: 0,
        status: 'completed',
        value: 0,
      }),
    ]

    const summary = createMonthlySummary(
      { month: 6, year: 2026 },
      appointments,
    )

    expect(summary.totalRevenue).toBe(270)
    expect(summary.totalClinicRevenue).toBe(81)
    expect(summary.totalProfessionalRevenue).toBe(189)
    expect(summary.totalCount).toBe(5)
    expect(summary.financialCount).toBe(3)
    expect(summary.appointmentCount).toBe(3)
    expect(summary.cancelledCount).toBe(1)
    expect(summary.noShowCount).toBe(1)
    expect(summary.giftCount).toBe(1)
  })

  it.each([
    ['scheduled', 0],
    ['cancelled', 1],
    ['no_show', 1],
  ] as const)(
    'keeps %s rows visible while reporting zero financial totals',
    (status, expectedCount) => {
      const appointments = [
        makeAppointment({
          clinicFeeValue: 33,
          professionalGainValue: 77,
          status: 'completed',
          value: 110,
        }),
        makeAppointment({
          clinicFeeValue: 33,
          professionalGainValue: 77,
          status: 'cancelled',
          value: 110,
        }),
        makeAppointment({
          clinicFeeValue: 30,
          professionalGainValue: 70,
          status: 'no_show',
          value: 100,
        }),
      ]

      const summary = createMonthlySummary(
        { month: 6, status, year: 2026 },
        appointments,
      )

      expect(summary.totalCount).toBe(expectedCount)
      expect(summary.financialCount).toBe(0)
      expect(summary.totalRevenue).toBe(0)
      expect(summary.totalClinicRevenue).toBe(0)
      expect(summary.totalProfessionalRevenue).toBe(0)
      expect(summary.rows.every((appointment) => appointment.status === status))
        .toBe(true)
    },
  )

  it('applies status, professional and service filters to one row set', () => {
    const appointments = [
      makeAppointment({
        clinicFeeValue: 33,
        professionalGainValue: 77,
        professionalId: 'professional-1',
        serviceId: 'service-1',
        status: 'completed',
        value: 110,
      }),
      makeAppointment({
        clinicFeeValue: 48,
        professionalGainValue: 112,
        professionalId: 'professional-2',
        serviceId: 'service-1',
        status: 'completed',
        value: 160,
      }),
      makeAppointment({
        clinicFeeValue: 33,
        professionalGainValue: 77,
        professionalId: 'professional-1',
        serviceId: 'service-2',
        status: 'completed',
        value: 110,
      }),
    ]

    const summary = createMonthlySummary(
      {
        month: 6,
        professionalId: 'professional-1',
        serviceId: 'service-1',
        status: 'completed',
        year: 2026,
      },
      appointments,
    )

    expect(summary.rows).toHaveLength(1)
    expect(summary.totalCount).toBe(1)
    expect(summary.financialCount).toBe(1)
    expect(summary.byProfessional).toHaveLength(1)
    expect(summary.byService).toHaveLength(1)
  })

  it('exports monthly report rows as CSV', () => {
    const appointments = [
      makeAppointment({
        clinicFeeValue: 33,
        professionalGainValue: 77,
        status: 'completed',
        value: 110,
      }),
      makeAppointment({
        clinicFeeValue: 48,
        professionalGainValue: 112,
        status: 'paid',
        value: 160,
      }),
    ]
    const reportInput = { month: 6, year: 2026 }
    const summary = createMonthlySummary(reportInput, appointments)
    const csv = createMonthlyReportCsv(reportInput, summary)
    const lines = csv.content.split('\n')

    expect(csv.filename).toBe('relatorio-mensal-2026-06.csv')
    expect(lines[0]).toBe(
      'Data;Hora;Paciente;Servico;Profissional;Status;Valor;Clinica;Ganho profissional',
    )
    expect(lines).toHaveLength(3)
    expect(lines[1].split(';')).toHaveLength(9)
    expect(lines[1]).toContain('Realizado')
  })
})
