import { describe, expect, it } from 'vitest'

import {
  getAppointmentMonthRange,
  isIsoCalendarDate,
  isValidAppointmentDateRange,
} from '../utils/appointmentPeriod'

describe('getAppointmentMonthRange', () => {
  it('returns an inclusive range for regular months', () => {
    expect(getAppointmentMonthRange(2026, 9)).toEqual({
      dateFrom: '2026-09-01',
      dateTo: '2026-09-30',
    })
  })

  it('handles year boundaries without changing the selected year', () => {
    expect(getAppointmentMonthRange(2026, 1)).toEqual({
      dateFrom: '2026-01-01',
      dateTo: '2026-01-31',
    })
    expect(getAppointmentMonthRange(2026, 12)).toEqual({
      dateFrom: '2026-12-01',
      dateTo: '2026-12-31',
    })
  })

  it('handles leap years', () => {
    expect(getAppointmentMonthRange(2028, 2).dateTo).toBe('2028-02-29')
    expect(getAppointmentMonthRange(2026, 2).dateTo).toBe('2026-02-28')
  })

  it('rejects invalid month inputs', () => {
    expect(() => getAppointmentMonthRange(2026, 0)).toThrow(RangeError)
    expect(() => getAppointmentMonthRange(2026, 13)).toThrow(RangeError)
  })
})

describe('appointment date range validation', () => {
  it('accepts inclusive ranges and the same start and end date', () => {
    expect(
      isValidAppointmentDateRange({
        dateFrom: '2026-09-01',
        dateTo: '2026-09-30',
      }),
    ).toBe(true)
    expect(
      isValidAppointmentDateRange({
        dateFrom: '2026-09-10',
        dateTo: '2026-09-10',
      }),
    ).toBe(true)
  })

  it('rejects inverted or invalid calendar ranges', () => {
    expect(
      isValidAppointmentDateRange({
        dateFrom: '2026-09-30',
        dateTo: '2026-09-01',
      }),
    ).toBe(false)
    expect(isIsoCalendarDate('2026-02-29')).toBe(false)
    expect(isIsoCalendarDate('2028-02-29')).toBe(true)
  })
})
