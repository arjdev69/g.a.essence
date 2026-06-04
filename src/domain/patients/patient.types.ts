export type Patient = {
  id: string
  userId: string
  name: string
  phone?: string | null
  birthDate?: string | null
  notes?: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export type PatientDTO = Omit<Patient, 'userId'>

export type PatientFilters = {
  search?: string
  active?: boolean
}

export type CreatePatientInput = {
  name: string
  phone?: string | null
  birthDate?: string | null
  notes?: string | null
  active?: boolean
}

export type UpdatePatientInput = Partial<CreatePatientInput>
