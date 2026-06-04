import { supabaseClient } from '../services/supabase/supabaseClient'
import type { Tables, TablesUpdate } from '../services/supabase/database.types'
import type {
  CreateProfessionalInput,
  ProfessionalDTO,
  ProfessionalFilters,
  UpdateProfessionalInput,
} from '../domain/professionals/professional.types'

type ProfessionalRow = Tables<'professionals'>

const professionalSelect =
  'id, name, phone, specialty, pix_key, default_clinic_fee_percentage, active, created_at, updated_at'

function toProfessionalDTO(
  row: Omit<ProfessionalRow, 'user_id'>,
): ProfessionalDTO {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    specialty: row.specialty,
    pixKey: row.pix_key,
    defaultClinicFeePercentage: row.default_clinic_fee_percentage,
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

function toProfessionalUpdate(
  input: UpdateProfessionalInput,
): TablesUpdate<'professionals'> {
  const update: TablesUpdate<'professionals'> = {}

  if (input.name !== undefined) {
    update.name = input.name
  }

  if (input.phone !== undefined) {
    update.phone = input.phone
  }

  if (input.specialty !== undefined) {
    update.specialty = input.specialty
  }

  if (input.pixKey !== undefined) {
    update.pix_key = input.pixKey
  }

  if (input.defaultClinicFeePercentage !== undefined) {
    update.default_clinic_fee_percentage = input.defaultClinicFeePercentage
  }

  if (input.active !== undefined) {
    update.active = input.active
  }

  return update
}

export const professionalRepository = {
  async list(filters?: ProfessionalFilters): Promise<ProfessionalDTO[]> {
    let query = supabaseClient
      .from('professionals')
      .select(professionalSelect)
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

    return data.map(toProfessionalDTO)
  },

  async create(input: CreateProfessionalInput): Promise<ProfessionalDTO> {
    const userId = await getRequiredUserId()

    const { data, error } = await supabaseClient
      .from('professionals')
      .insert({
        user_id: userId,
        name: input.name,
        phone: input.phone ?? null,
        specialty: input.specialty ?? null,
        pix_key: input.pixKey ?? null,
        default_clinic_fee_percentage:
          input.defaultClinicFeePercentage ?? 30,
        active: input.active ?? true,
      })
      .select(professionalSelect)
      .single()

    if (error) {
      throw error
    }

    return toProfessionalDTO(data)
  },

  async update(
    id: string,
    input: UpdateProfessionalInput,
  ): Promise<ProfessionalDTO> {
    const { data, error } = await supabaseClient
      .from('professionals')
      .update(toProfessionalUpdate(input))
      .eq('id', id)
      .select(professionalSelect)
      .single()

    if (error) {
      throw error
    }

    return toProfessionalDTO(data)
  },

  async deactivate(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from('professionals')
      .update({ active: false })
      .eq('id', id)

    if (error) {
      throw error
    }
  },
}
