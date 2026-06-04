import { isFinancialStatus } from '../appointments/isFinancialStatus'
import type { AppointmentDTO } from '../appointments/appointment.types'
import type { MonthlyReportInput, MonthlyReportOutput } from './report.types'

type SummaryGroup = {
  count: number
  name: string
  total: number
}

function matchesMonth(appointmentDate: string, month: number, year: number) {
  const [dateYear, dateMonth] = appointmentDate.split('-').map(Number)

  return dateYear === year && dateMonth === month
}

function roundCurrency(value: number) {
  return Number(value.toFixed(2))
}

function toGroupName(value: string | undefined) {
  return value?.trim() ? value : '-'
}

export function createMonthlySummary(
  input: MonthlyReportInput,
  appointments: AppointmentDTO[],
): MonthlyReportOutput {
  const rows = appointments.filter((appointment) => {
    if (!matchesMonth(appointment.appointmentDate, input.month, input.year)) {
      return false
    }

    if (
      input.professionalId &&
      appointment.professionalId !== input.professionalId
    ) {
      return false
    }

    if (input.serviceId && appointment.serviceId !== input.serviceId) {
      return false
    }

    return true
  })

  const financialRows = rows.filter((appointment) =>
    isFinancialStatus(appointment.status),
  )
  const byService = new Map<string, SummaryGroup>()
  const byProfessional = new Map<string, SummaryGroup>()

  for (const appointment of financialRows) {
    const service = byService.get(appointment.serviceId) ?? {
      count: 0,
      name: toGroupName(appointment.serviceName),
      total: 0,
    }
    service.count += 1
    service.total = roundCurrency(service.total + appointment.value)
    byService.set(appointment.serviceId, service)

    const professional = byProfessional.get(appointment.professionalId) ?? {
      count: 0,
      name: toGroupName(appointment.professionalName),
      total: 0,
    }
    professional.count += 1
    professional.total = roundCurrency(professional.total + appointment.value)
    byProfessional.set(appointment.professionalId, professional)
  }

  return {
    appointmentCount: financialRows.length,
    byProfessional: Array.from(byProfessional, ([professionalId, group]) => ({
      count: group.count,
      professionalId,
      professionalName: group.name,
      total: group.total,
    })),
    byService: Array.from(byService, ([serviceId, group]) => ({
      count: group.count,
      serviceId,
      serviceName: group.name,
      total: group.total,
    })),
    cancelledCount: rows.filter(
      (appointment) => appointment.status === 'cancelled',
    ).length,
    giftCount: financialRows.filter((appointment) => appointment.value === 0)
      .length,
    noShowCount: rows.filter((appointment) => appointment.status === 'no_show')
      .length,
    rows,
    totalClinicRevenue: roundCurrency(
      financialRows.reduce(
        (total, appointment) => total + appointment.clinicFeeValue,
        0,
      ),
    ),
    totalProfessionalRevenue: roundCurrency(
      financialRows.reduce(
        (total, appointment) => total + appointment.professionalGainValue,
        0,
      ),
    ),
    totalRevenue: roundCurrency(
      financialRows.reduce((total, appointment) => total + appointment.value, 0),
    ),
  }
}
