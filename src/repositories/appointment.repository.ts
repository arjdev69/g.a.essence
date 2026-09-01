import { calculateAppointmentSplit } from '../domain/appointments/calculateAppointmentSplit'
import type {
  AppointmentDTO,
  AppointmentFilters,
  AppointmentStatus,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '../domain/appointments/appointment.types'
import { supabaseClient } from '../services/supabase/supabaseClient'
import type { Tables, TablesUpdate } from '../services/supabase/database.types'

type AppointmentRow = Tables<'appointments'>
type AppointmentRelation = { name: string } | null

type AppointmentQueryRow = Omit<AppointmentRow, 'user_id'> & {
  patients: AppointmentRelation
  professionals: AppointmentRelation
  services: AppointmentRelation
}

const appointmentStatuses = [
  'scheduled',
  'completed',
  'cancelled',
  'no_show',
  'paid',
] as const satisfies readonly AppointmentStatus[]

const appointmentSelect = `
  id,
  patient_id,
  professional_id,
  service_id,
  appointment_date,
  appointment_time,
  description,
  notes,
  value,
  clinic_fee_percentage,
  clinic_fee_value,
  professional_gain_value,
  status,
  created_at,
  updated_at,
  patients(name),
  professionals(name),
  services(name)
`

function isAppointmentStatus(status: string): status is AppointmentStatus {
  return appointmentStatuses.includes(status as AppointmentStatus)
}

function toAppointmentDTO(row: AppointmentQueryRow): AppointmentDTO {
  if (!isAppointmentStatus(row.status)) {
    throw new Error(`Status de atendimento invalido: ${row.status}`)
  }

  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patients?.name,
    professionalId: row.professional_id,
    professionalName: row.professionals?.name,
    serviceId: row.service_id,
    serviceName: row.services?.name,
    appointmentDate: row.appointment_date,
    appointmentTime: row.appointment_time,
    description: row.description,
    notes: row.notes,
    value: row.value,
    clinicFeePercentage: row.clinic_fee_percentage,
    clinicFeeValue: row.clinic_fee_value,
    professionalGainValue: row.professional_gain_value,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function getRequiredUserId() {
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser()

  if (error || !user) {
    throw error ?? new Error('Usuario autenticado nao encontrado.')
  }

  return user.id
}

function toAppointmentCreate(input: CreateAppointmentInput, userId: string) {
  const { clinicFeeValue, professionalGainValue } = calculateAppointmentSplit(
    input.value,
    input.clinicFeePercentage,
  )

  return {
    user_id: userId,
    patient_id: input.patientId,
    professional_id: input.professionalId,
    service_id: input.serviceId,
    appointment_date: input.appointmentDate,
    appointment_time: input.appointmentTime,
    description: input.description ?? null,
    notes: input.notes ?? null,
    value: input.value,
    clinic_fee_percentage: input.clinicFeePercentage,
    clinic_fee_value: clinicFeeValue,
    professional_gain_value: professionalGainValue,
    status: input.status,
  }
}

async function toAppointmentUpdate(
  id: string,
  input: UpdateAppointmentInput,
): Promise<TablesUpdate<'appointments'>> {
  const update: TablesUpdate<'appointments'> = {}

  if (input.patientId !== undefined) {
    update.patient_id = input.patientId
  }

  if (input.professionalId !== undefined) {
    update.professional_id = input.professionalId
  }

  if (input.serviceId !== undefined) {
    update.service_id = input.serviceId
  }

  if (input.appointmentDate !== undefined) {
    update.appointment_date = input.appointmentDate
  }

  if (input.appointmentTime !== undefined) {
    update.appointment_time = input.appointmentTime
  }

  if (input.description !== undefined) {
    update.description = input.description
  }

  if (input.notes !== undefined) {
    update.notes = input.notes
  }

  if (input.value !== undefined) {
    update.value = input.value
  }

  if (input.clinicFeePercentage !== undefined) {
    update.clinic_fee_percentage = input.clinicFeePercentage
  }

  if (input.status !== undefined) {
    update.status = input.status
  }

  if (input.value !== undefined || input.clinicFeePercentage !== undefined) {
    const { data, error } = await supabaseClient
      .from('appointments')
      .select('value, clinic_fee_percentage')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    const value = input.value ?? data.value
    const percentage = input.clinicFeePercentage ?? data.clinic_fee_percentage
    const { clinicFeeValue, professionalGainValue } =
      calculateAppointmentSplit(value, percentage)

    update.clinic_fee_value = clinicFeeValue
    update.professional_gain_value = professionalGainValue
  }

  return update
}

export const appointmentRepository = {
  async list(filters: AppointmentFilters = {}): Promise<AppointmentDTO[]> {
    let query = supabaseClient
      .from('appointments')
      .select(appointmentSelect)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })

    if (filters.date) {
      query = query.eq('appointment_date', filters.date)
    } else {
      if (filters.dateFrom) {
        query = query.gte('appointment_date', filters.dateFrom)
      }

      if (filters.dateTo) {
        query = query.lte('appointment_date', filters.dateTo)
      }
    }

    if (filters.patientId) {
      query = query.eq('patient_id', filters.patientId)
    }

    if (filters.professionalId) {
      query = query.eq('professional_id', filters.professionalId)
    }

    if (filters.serviceId) {
      query = query.eq('service_id', filters.serviceId)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return (data as AppointmentQueryRow[]).map(toAppointmentDTO)
  },

  async create(input: CreateAppointmentInput): Promise<AppointmentDTO> {
    const userId = await getRequiredUserId()

    const { data, error } = await supabaseClient
      .from('appointments')
      .insert(toAppointmentCreate(input, userId))
      .select(appointmentSelect)
      .single()

    if (error) {
      throw error
    }

    return toAppointmentDTO(data as AppointmentQueryRow)
  },

  async update(
    id: string,
    input: UpdateAppointmentInput,
  ): Promise<AppointmentDTO> {
    const update = await toAppointmentUpdate(id, input)

    const { data, error } = await supabaseClient
      .from('appointments')
      .update(update)
      .eq('id', id)
      .select(appointmentSelect)
      .single()

    if (error) {
      throw error
    }

    return toAppointmentDTO(data as AppointmentQueryRow)
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from('appointments')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  },
}
