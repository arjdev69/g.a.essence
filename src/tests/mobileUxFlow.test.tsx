// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as axe from 'axe-core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppointmentDTO } from '../domain/appointments'
import type { PatientDTO } from '../domain/patients/patient.types'
import type { ProfessionalDTO } from '../domain/professionals/professional.types'
import type { ServiceDTO } from '../domain/services/service.types'

vi.mock('../features/auth/useLogin', () => ({
  useLogin: () => ({ errorMessage: null, signIn: vi.fn() }),
}))

vi.mock('../repositories/appointment.repository', () => ({
  appointmentRepository: { list: vi.fn() },
}))

vi.mock('../repositories/patient.repository', () => ({
  patientRepository: {
    create: vi.fn(),
    deactivate: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('../repositories/professional.repository', () => ({
  professionalRepository: {
    create: vi.fn(),
    deactivate: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('../repositories/service.repository', () => ({
  serviceRepository: {
    create: vi.fn(),
    deactivate: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
  },
}))

import { LoginPage } from '../features/auth/LoginPage'
import { AppointmentsPage } from '../features/appointments/AppointmentsPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { PatientsPage } from '../features/patients/PatientsPage'
import { ProfessionalsPage } from '../features/professionals/ProfessionalsPage'
import { ServicesPage } from '../features/services/ServicesPage'
import { appointmentRepository } from '../repositories/appointment.repository'
import { patientRepository } from '../repositories/patient.repository'
import { professionalRepository } from '../repositories/professional.repository'
import { serviceRepository } from '../repositories/service.repository'

const timestamp = '2026-01-01T00:00:00Z'

const patient: PatientDTO = {
  active: true,
  birthDate: null,
  createdAt: timestamp,
  id: 'patient-1',
  name: 'Maria Silva',
  notes: null,
  phone: null,
  updatedAt: timestamp,
}

const professional: ProfessionalDTO = {
  active: true,
  createdAt: timestamp,
  defaultClinicFeePercentage: 30,
  id: 'professional-1',
  name: 'Ana Costa',
  phone: null,
  pixKey: null,
  specialty: 'Massoterapia',
  updatedAt: timestamp,
}

const service: ServiceDTO = {
  active: true,
  clinicFeePercentage: 30,
  createdAt: timestamp,
  defaultValue: 110,
  durationMinutes: 60,
  id: 'service-1',
  name: 'Massagem relaxante',
  updatedAt: timestamp,
}

function todayKey() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const appointment: AppointmentDTO = {
  appointmentDate: todayKey(),
  appointmentTime: '09:00:00',
  clinicFeePercentage: 30,
  clinicFeeValue: 33,
  createdAt: timestamp,
  description: null,
  id: 'appointment-1',
  notes: null,
  patientId: patient.id,
  patientName: patient.name,
  professionalGainValue: 77,
  professionalId: professional.id,
  professionalName: professional.name,
  serviceId: service.id,
  serviceName: service.name,
  status: 'scheduled',
  updatedAt: timestamp,
  value: 110,
}

let mounted: Array<{ container: HTMLDivElement; root: Root }> = []

function renderNode(node: React.ReactNode) {
  const container = document.createElement('div')
  const root = createRoot(container)

  document.body.appendChild(container)
  mounted.push({ container, root })
  act(() => root.render(node))

  return container
}

function renderQueryNode(node: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return renderNode(
    <QueryClientProvider client={queryClient}>{node}</QueryClientProvider>,
  )
}

async function settleQueries() {
  await act(async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 30))
  })
}

function expectSeriousAxeViolationsToBeEmpty(results: axe.AxeResults) {
  expect(
    results.violations.filter(
      (violation) =>
        violation.impact === 'critical' || violation.impact === 'serious',
    ),
  ).toEqual([])
}

function expectRetryAction(container: HTMLElement) {
  const retryButton = Array.from(container.querySelectorAll('button')).find(
    (button) => button.textContent?.includes('Tentar novamente'),
  )

  expect(retryButton).not.toBeUndefined()
  expect(retryButton?.className).toContain('min-h-11')

  return retryButton
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('matchMedia', () => ({
    addEventListener: vi.fn(),
    matches: false,
    removeEventListener: vi.fn(),
  }))
  vi.mocked(appointmentRepository.list).mockResolvedValue([appointment])
  vi.mocked(patientRepository.list).mockResolvedValue([patient])
  vi.mocked(professionalRepository.list).mockResolvedValue([professional])
  vi.mocked(serviceRepository.list).mockResolvedValue([service])
})

afterEach(() => {
  mounted.forEach(({ container, root }) => {
    act(() => root.unmount())
    container.remove()
  })
  mounted = []
  vi.clearAllMocks()
})

describe('fluxo integrado da UX mobile', () => {
  it('expõe loading e vazio sem perder o contexto da tela', async () => {
    vi.mocked(patientRepository.list).mockImplementation(
      () => new Promise(() => {}),
    )
    const loadingContainer = renderQueryNode(<PatientsPage />)
    expect(loadingContainer.querySelector('[role="status"]')).not.toBeNull()

    vi.mocked(serviceRepository.list).mockResolvedValueOnce([])
    const emptyContainer = renderQueryNode(<ServicesPage />)
    await settleQueries()

    expect(emptyContainer.textContent).toContain('Nenhum servico encontrado.')
  })

  it('recupera erros de carregamento nas telas de dados', async () => {
    vi.mocked(patientRepository.list).mockRejectedValueOnce(new Error('offline'))
    const patients = renderQueryNode(<PatientsPage />)
    await settleQueries()
    const patientRetry = expectRetryAction(patients)
    vi.mocked(patientRepository.list).mockResolvedValueOnce([patient])
    act(() => patientRetry?.click())
    await settleQueries()
    expect(patients.querySelector('[role="alert"]')).toBeNull()
    expect(patients.textContent).toContain('Maria Silva')

    vi.mocked(professionalRepository.list).mockRejectedValueOnce(new Error('offline'))
    const professionals = renderQueryNode(<ProfessionalsPage />)
    await settleQueries()
    expectRetryAction(professionals)

    vi.mocked(serviceRepository.list).mockRejectedValueOnce(new Error('offline'))
    const services = renderQueryNode(<ServicesPage />)
    await settleQueries()
    expectRetryAction(services)

    vi.mocked(appointmentRepository.list).mockRejectedValueOnce(new Error('offline'))
    const dashboard = renderQueryNode(<DashboardPage />)
    await settleQueries()
    expectRetryAction(dashboard)
  })

  it('mantém a recuperação da agenda e as variantes desktop/mobile', async () => {
    vi.mocked(appointmentRepository.list).mockRejectedValueOnce(new Error('offline'))
    const appointments = renderQueryNode(<AppointmentsPage />)
    await settleQueries()

    const retryButton = expectRetryAction(appointments)
    vi.mocked(appointmentRepository.list).mockResolvedValueOnce([appointment])
    act(() => retryButton?.click())
    await settleQueries()
    expect(appointments.querySelector('[role="alert"]')).toBeNull()
    expect(
      Array.from(appointments.querySelectorAll('div')).some((element) =>
        element.classList.contains('xl:hidden'),
      ),
    ).toBe(true)
    expect(
      Array.from(appointments.querySelectorAll('div')).some((element) =>
        element.classList.contains('xl:block'),
      ),
    ).toBe(true)
  })

  it('não apresenta violações axe críticas ou sérias no estado completo', async () => {
    const pages = [
      renderNode(<LoginPage />),
      renderQueryNode(<DashboardPage />),
      renderQueryNode(<PatientsPage />),
      renderQueryNode(<ProfessionalsPage />),
      renderQueryNode(<ServicesPage />),
      renderQueryNode(<AppointmentsPage />),
    ]

    await settleQueries()

    for (const page of pages) {
      expectSeriousAxeViolationsToBeEmpty(await axe.run(page))
    }
  }, 20_000)

  it('preserva a troca para cards no mobile e tabelas no desktop', async () => {
    const pages = [
      renderQueryNode(<PatientsPage />),
      renderQueryNode(<ProfessionalsPage />),
      renderQueryNode(<ServicesPage />),
    ]

    await settleQueries()

    for (const page of pages) {
      expect(
        Array.from(page.querySelectorAll('div')).some(
          (element) =>
            element.classList.contains('hidden') &&
            (element.classList.contains('md:block') ||
              element.classList.contains('lg:block')),
        ),
      ).toBe(true)
      expect(
        Array.from(page.querySelectorAll('div')).some((element) =>
          element.classList.contains('md:hidden') ||
          element.classList.contains('lg:hidden'),
        ),
      ).toBe(true)
    }
  })
})
