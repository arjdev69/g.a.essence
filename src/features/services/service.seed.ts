import type { CreateServiceInput } from '../../domain/services/service.types'
import { serviceRepository } from '../../repositories/service.repository'

export const defaultServiceSeeds = [
  {
    name: 'Massagem Terapêutica',
    defaultValue: 110,
    durationMinutes: 60,
    clinicFeePercentage: 30,
    active: true,
  },
  {
    name: 'SPA dos pés',
    defaultValue: 110,
    durationMinutes: 60,
    clinicFeePercentage: 30,
    active: true,
  },
  {
    name: 'Drenagem Linfática',
    defaultValue: 160,
    durationMinutes: 60,
    clinicFeePercentage: 30,
    active: true,
  },
  {
    name: 'Brinde massagem facial',
    defaultValue: 0,
    durationMinutes: 30,
    clinicFeePercentage: 0,
    active: true,
  },
  {
    name: 'Brinde SPA dos pés',
    defaultValue: 0,
    durationMinutes: 30,
    clinicFeePercentage: 0,
    active: true,
  },
] satisfies CreateServiceInput[]

function normalizeServiceName(name: string) {
  return name.trim().toLocaleLowerCase('pt-BR')
}

export async function seedDefaultServices() {
  const existingServices = await serviceRepository.list()
  const existingServiceNames = new Set(
    existingServices.map((service) => normalizeServiceName(service.name)),
  )

  const missingServices = defaultServiceSeeds.filter(
    (service) => !existingServiceNames.has(normalizeServiceName(service.name)),
  )

  return Promise.all(
    missingServices.map((service) => serviceRepository.create(service)),
  )
}
