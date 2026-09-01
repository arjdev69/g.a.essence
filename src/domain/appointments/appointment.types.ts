export type AppointmentStatus =
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'paid'

export type Appointment = {
  id: string
  userId: string
  patientId: string
  professionalId: string
  serviceId: string
  appointmentDate: string
  appointmentTime: string
  description?: string | null
  notes?: string | null
  value: number
  clinicFeePercentage: number
  clinicFeeValue: number
  professionalGainValue: number
  status: AppointmentStatus
  createdAt: string
  updatedAt: string
}

export type AppointmentDTO = Omit<Appointment, 'userId'> & {
  patientName?: string
  professionalName?: string
  serviceName?: string
}

export type AppointmentFilters = {
  date?: string
  dateFrom?: string
  dateTo?: string
  patientId?: string
  professionalId?: string
  serviceId?: string
  status?: AppointmentStatus
}

export type CreateAppointmentInput = {
  patientId: string
  professionalId: string
  serviceId: string
  appointmentDate: string
  appointmentTime: string
  description?: string | null
  notes?: string | null
  value: number
  clinicFeePercentage: number
  status: AppointmentStatus
}

export type UpdateAppointmentInput = Partial<CreateAppointmentInput>
