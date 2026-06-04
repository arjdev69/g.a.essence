export type Professional = {
  id: string
  userId: string
  name: string
  phone?: string | null
  specialty?: string | null
  pixKey?: string | null
  defaultClinicFeePercentage: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export type ProfessionalDTO = Omit<Professional, 'userId'>

export type ProfessionalFilters = {
  search?: string
  active?: boolean
}

export type CreateProfessionalInput = {
  name: string
  phone?: string | null
  specialty?: string | null
  pixKey?: string | null
  defaultClinicFeePercentage?: number
  active?: boolean
}

export type UpdateProfessionalInput = Partial<CreateProfessionalInput>
