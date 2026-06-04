import { supabaseClient } from '../services/supabase/supabaseClient'
import type { Tables, TablesUpdate } from '../services/supabase/database.types'
import type {
  CreateServiceInput,
  ServiceDTO,
  ServiceFilters,
  UpdateServiceInput,
} from '../domain/services/service.types'

type ServiceRow = Tables<'services'>

const serviceSelect =
  'id, name, default_value, duration_minutes, clinic_fee_percentage, active, created_at, updated_at'

function toServiceDTO(row: Omit<ServiceRow, 'user_id'>): ServiceDTO {
  return {
    id: row.id,
    name: row.name,
    defaultValue: row.default_value,
    durationMinutes: row.duration_minutes,
    clinicFeePercentage: row.clinic_fee_percentage,
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

function toServiceUpdate(input: UpdateServiceInput): TablesUpdate<'services'> {
  const update: TablesUpdate<'services'> = {}

  if (input.name !== undefined) {
    update.name = input.name
  }

  if (input.defaultValue !== undefined) {
    update.default_value = input.defaultValue
  }

  if (input.durationMinutes !== undefined) {
    update.duration_minutes = input.durationMinutes
  }

  if (input.clinicFeePercentage !== undefined) {
    update.clinic_fee_percentage = input.clinicFeePercentage
  }

  if (input.active !== undefined) {
    update.active = input.active
  }

  return update
}

export const serviceRepository = {
  async list(filters?: ServiceFilters): Promise<ServiceDTO[]> {
    let query = supabaseClient
      .from('services')
      .select(serviceSelect)
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

    return data.map(toServiceDTO)
  },

  async create(input: CreateServiceInput): Promise<ServiceDTO> {
    const userId = await getRequiredUserId()

    const { data, error } = await supabaseClient
      .from('services')
      .insert({
        user_id: userId,
        name: input.name,
        default_value: input.defaultValue,
        duration_minutes: input.durationMinutes,
        clinic_fee_percentage: input.clinicFeePercentage,
        active: input.active ?? true,
      })
      .select(serviceSelect)
      .single()

    if (error) {
      throw error
    }

    return toServiceDTO(data)
  },

  async update(id: string, input: UpdateServiceInput): Promise<ServiceDTO> {
    const { data, error } = await supabaseClient
      .from('services')
      .update(toServiceUpdate(input))
      .eq('id', id)
      .select(serviceSelect)
      .single()

    if (error) {
      throw error
    }

    return toServiceDTO(data)
  },

  async deactivate(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from('services')
      .update({ active: false })
      .eq('id', id)

    if (error) {
      throw error
    }
  },
}
