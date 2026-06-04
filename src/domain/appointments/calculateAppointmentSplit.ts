export type AppointmentSplit = {
  clinicFeeValue: number
  professionalGainValue: number
}

export function calculateAppointmentSplit(
  value: number,
  percentage: number,
): AppointmentSplit {
  if (value <= 0) {
    return { clinicFeeValue: 0, professionalGainValue: 0 }
  }

  const clinicFeeValue = Number((value * (percentage / 100)).toFixed(2))
  const professionalGainValue = Number((value - clinicFeeValue).toFixed(2))

  return { clinicFeeValue, professionalGainValue }
}
