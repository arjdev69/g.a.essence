import { describe, expect, it } from 'vitest'

import {
  createAppointmentNavigationState,
  shouldOpenAppointmentFormFromState,
} from '../app/appointmentNavigation'

describe('appointment navigation', () => {
  it('creates navigation state that requests the appointment form to open', () => {
    expect(createAppointmentNavigationState(123)).toEqual({
      createAppointmentRequest: 123,
    })
  })

  it.each([
    { expected: true, state: { createAppointmentRequest: 123 } },
    { expected: false, state: null },
    { expected: false, state: undefined },
    { expected: false, state: {} },
    { expected: false, state: { createAppointmentRequest: '123' } },
  ])('returns $expected for state $state', ({ expected, state }) => {
    expect(shouldOpenAppointmentFormFromState(state)).toBe(expected)
  })
})
