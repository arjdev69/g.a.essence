import { supabaseClient } from '../services/supabase/supabaseClient'
import type { Tables, TablesUpdate } from '../services/supabase/database.types'
import type {
  CreatePatientInput,
  PatientDTO,
  PatientFilters,
  UpdatePatientInput,
} from '../domain/patients/patient.types'

type PatientRow = Tables<'patients'>

const patientSelect =
  'id, name, phone, birth_date, notes, active, created_at, updated_at'

function toPatientDTO(row: Omit<PatientRow, 'user_id'>): PatientDTO {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    birthDate: row.birth_date,
    notes: row.notes,
    active: row.active,
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

function toPatientUpdate(input: UpdatePatientInput): TablesUpdate<'patients'> {
  const update: TablesUpdate<'patients'> = {}

  if (input.name !== undefined) {
    update.name = input.name
  }

  if (input.phone !== undefined) {
    update.phone = input.phone
  }

  if (input.birthDate !== undefined) {
    update.birth_date = input.birthDate
  }

  if (input.notes !== undefined) {
    update.notes = input.notes
  }

  if (input.active !== undefined) {
    update.active = input.active
  }

  return update
}

export const patientRepository = {
  async list(filters?: PatientFilters): Promise<PatientDTO[]> {
    let query = supabaseClient
      .from('patients')
      .select(patientSelect)
      .order('name', { ascending: true })

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    if (filters?.active !== undefined) {
      query = query.eq('active', filters.active)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data.map(toPatientDTO)
  },

  async create(input: CreatePatientInput): Promise<PatientDTO> {
    const userId = await getRequiredUserId()

    const { data, error } = await supabaseClient
      .from('patients')
      .insert({
        user_id: userId,
        name: input.name,
        phone: input.phone ?? null,
        birth_date: input.birthDate ?? null,
        notes: input.notes ?? null,
        active: input.active ?? true,
      })
      .select(patientSelect)
      .single()

    if (error) {
      throw error
    }

    return toPatientDTO(data)
  },

  async update(id: string, input: UpdatePatientInput): Promise<PatientDTO> {
    const { data, error } = await supabaseClient
      .from('patients')
      .update(toPatientUpdate(input))
      .eq('id', id)
      .select(patientSelect)
      .single()

    if (error) {
      throw error
    }

    return toPatientDTO(data)
  },

  async deactivate(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from('patients')
      .update({ active: false })
      .eq('id', id)

    if (error) {
      throw error
    }
  },
}
