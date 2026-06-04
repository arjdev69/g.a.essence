export type ClinicService = {
  id: string
  userId: string
  name: string
  defaultValue: number
  durationMinutes: number
  clinicFeePercentage: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export type ServiceDTO = Omit<ClinicService, 'userId'>

export type ServiceFilters = {
  search?: string
  active?: boolean
}

export type CreateServiceInput = {
  name: string
  defaultValue: number
  durationMinutes: number
  clinicFeePercentage: number
  active?: boolean
}

export type UpdateServiceInput = Partial<CreateServiceInput>
