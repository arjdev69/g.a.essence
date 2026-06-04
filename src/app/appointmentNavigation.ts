export type AppointmentNavigationState = {
  createAppointmentRequest: number
}

export function createAppointmentNavigationState(
  timestamp = Date.now(),
): AppointmentNavigationState {
  return { createAppointmentRequest: timestamp }
}

export function shouldOpenAppointmentFormFromState(state: unknown) {
  return (
    typeof state === 'object' &&
    state !== null &&
    'createAppointmentRequest' in state &&
    typeof state.createAppointmentRequest === 'number'
  )
}
