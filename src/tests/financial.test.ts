import { describe, expect, it } from 'vitest'

import { calculateAppointmentSplit, isFinancialStatus } from '../domain/appointments'
import { formatCurrencyBRL } from '../utils'

describe('calculateAppointmentSplit', () => {
  it.each([
    { value: 110, percentage: 30, clinicFeeValue: 33, professionalGainValue: 77 },
    { value: 160, percentage: 30, clinicFeeValue: 48, professionalGainValue: 112 },
    { value: 0, percentage: 30, clinicFeeValue: 0, professionalGainValue: 0 },
    { value: 100, percentage: 0, clinicFeeValue: 0, professionalGainValue: 100 },
    { value: 100, percentage: 100, clinicFeeValue: 100, professionalGainValue: 0 },
  ])(
    'splits $value with $percentage% clinic fee',
    ({ value, percentage, clinicFeeValue, professionalGainValue }) => {
      expect(calculateAppointmentSplit(value, percentage)).toEqual({
        clinicFeeValue,
        professionalGainValue,
      })
    },
  )
})

describe('isFinancialStatus', () => {
  it.each([
    { status: 'completed' as const, expected: true },
    { status: 'paid' as const, expected: true },
    { status: 'scheduled' as const, expected: false },
    { status: 'cancelled' as const, expected: false },
    { status: 'no_show' as const, expected: false },
  ])('returns $expected for $status', ({ status, expected }) => {
    expect(isFinancialStatus(status)).toBe(expected)
  })
})

describe('formatCurrencyBRL', () => {
  it('formats values as Brazilian Real currency', () => {
    expect(formatCurrencyBRL(110)).toBe('R$ 110,00')
  })
})
