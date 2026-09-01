export type AppointmentDateRange = {
  dateFrom: string
  dateTo: string
}

const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/

function formatIsoDate(year: number, month: number, day: number) {
  return [
    String(year).padStart(4, '0'),
    String(month).padStart(2, '0'),
    String(day).padStart(2, '0'),
  ].join('-')
}

export function isIsoCalendarDate(value: string) {
  const match = isoDatePattern.exec(value)

  if (!match) {
    return false
  }

  const [, yearText, monthText, dayText] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

export function isValidAppointmentDateRange(range: AppointmentDateRange) {
  return (
    isIsoCalendarDate(range.dateFrom) &&
    isIsoCalendarDate(range.dateTo) &&
    range.dateFrom <= range.dateTo
  )
}

export function getAppointmentMonthRange(
  year: number,
  month: number,
): AppointmentDateRange {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError('Mes e ano devem formar um periodo valido.')
  }

  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()

  return {
    dateFrom: formatIsoDate(year, month, 1),
    dateTo: formatIsoDate(year, month, lastDay),
  }
}
