import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getAppointmentMonthRange,
  isIsoCalendarDate,
  isValidAppointmentDateRange,
} from '../utils/appointmentPeriod'

const repositoryMock = vi.hoisted(() => {
  const calls: Array<{ method: string; column: string; value: string }> = []
  const query = {
    eq: vi.fn((column: string, value: string) => {
      calls.push({ column, method: 'eq', value })
      return query
    }),
    gte: vi.fn((column: string, value: string) => {
      calls.push({ column, method: 'gte', value })
      return query
    }),
    lte: vi.fn((column: string, value: string) => {
      calls.push({ column, method: 'lte', value })
      return query
    }),
    order: vi.fn(() => query),
    select: vi.fn(() => query),
    then: (
      onFulfilled: (value: { data: unknown[]; error: null }) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => Promise.resolve({ data: [], error: null }).then(onFulfilled, onRejected),
  }

  return {
    calls,
    from: vi.fn(() => query),
    query,
  }
})

vi.mock('../services/supabase/supabaseClient', () => ({
  supabaseClient: {
    auth: { getUser: vi.fn() },
    from: repositoryMock.from,
  },
}))

import { appointmentRepository } from '../repositories/appointment.repository'

beforeEach(() => {
  repositoryMock.calls.length = 0
  vi.clearAllMocks()
})

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

describe('appointmentRepository date filters', () => {
  it('applies inclusive dates and structured filters to the query', async () => {
    await appointmentRepository.list({
      dateFrom: '2026-09-01',
      dateTo: '2026-09-30',
      patientId: 'patient-1',
      professionalId: 'professional-1',
      serviceId: 'service-1',
      status: 'completed',
    })

    expect(repositoryMock.calls).toEqual([
      { column: 'appointment_date', method: 'gte', value: '2026-09-01' },
      { column: 'appointment_date', method: 'lte', value: '2026-09-30' },
      { column: 'patient_id', method: 'eq', value: 'patient-1' },
      { column: 'professional_id', method: 'eq', value: 'professional-1' },
      { column: 'service_id', method: 'eq', value: 'service-1' },
      { column: 'status', method: 'eq', value: 'completed' },
    ])
  })

  it('keeps an exact date filter authoritative over a range', async () => {
    await appointmentRepository.list({
      date: '2026-09-10',
      dateFrom: '2026-09-01',
      dateTo: '2026-09-30',
    })

    expect(repositoryMock.calls).toEqual([
      { column: 'appointment_date', method: 'eq', value: '2026-09-10' },
    ])
  })
})
