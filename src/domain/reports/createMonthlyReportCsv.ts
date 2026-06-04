import type { AppointmentStatus } from '../appointments'
import type { MonthlyReportInput, MonthlyReportOutput } from './report.types'

const statusLabels: Record<AppointmentStatus, string> = {
  cancelled: 'Cancelado',
  completed: 'Realizado',
  no_show: 'Faltou',
  paid: 'Pago',
  scheduled: 'Agendado',
}

const csvHeaders = [
  'Data',
  'Hora',
  'Paciente',
  'Servico',
  'Profissional',
  'Status',
  'Valor',
  'Clinica',
  'Ganho profissional',
]

function csvValue(value: number | string | null | undefined) {
  const stringValue = value === null || value === undefined ? '' : String(value)

  if (
    stringValue.includes(';') ||
    stringValue.includes('"') ||
    stringValue.includes('\n')
  ) {
    return `"${stringValue.replaceAll('"', '""')}"`
  }

  return stringValue
}

function formatTime(time: string) {
  return time.slice(0, 5)
}

function formatFileMonth(month: number) {
  return String(month).padStart(2, '0')
}

export function createMonthlyReportCsv(
  input: MonthlyReportInput,
  summary: MonthlyReportOutput,
) {
  const lines = [
    csvHeaders.join(';'),
    ...summary.rows.map((appointment) =>
      [
        appointment.appointmentDate,
        formatTime(appointment.appointmentTime),
        appointment.patientName,
        appointment.serviceName,
        appointment.professionalName,
        statusLabels[appointment.status],
        appointment.value,
        appointment.clinicFeeValue,
        appointment.professionalGainValue,
      ]
        .map(csvValue)
        .join(';'),
    ),
  ]

  return {
    content: lines.join('\n'),
    filename: `relatorio-mensal-${input.year}-${formatFileMonth(
      input.month,
    )}.csv`,
  }
}
