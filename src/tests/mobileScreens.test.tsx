// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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

vi.mock('../repositories/product.repository', () => ({
  productRepository: {
    create: vi.fn(),
    deactivate: vi.fn(),
    exportCsv: vi.fn(),
    getById: vi.fn(),
    getSummary: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('../repositories/productSalesSummary.repository', () => ({
  productSalesSummaryRepository: {
    getByProduct: vi.fn(),
  },
}))

vi.mock('../repositories/stockMovement.repository', () => ({
  stockMovementRepository: {
    create: vi.fn(),
    listByProductId: vi.fn(),
    listRecent: vi.fn(),
  },
}))

vi.mock('../services/storage/productImageStorage', () => ({
  deleteProductImageByUrl: vi.fn(),
  uploadProductImage: vi.fn(),
  validateProductImageFile: vi.fn(() => null),
}))

import { LoginPage } from '../features/auth/LoginPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { PatientsPage } from '../features/patients/PatientsPage'
import { ProfessionalsPage } from '../features/professionals/ProfessionalsPage'
import { ProductsPage } from '../features/products/ProductsPage'
import { ServicesPage } from '../features/services/ServicesPage'
import { appointmentRepository } from '../repositories/appointment.repository'
import { patientRepository } from '../repositories/patient.repository'
import { professionalRepository } from '../repositories/professional.repository'
import { serviceRepository } from '../repositories/service.repository'
import { productRepository } from '../repositories/product.repository'
import { productSalesSummaryRepository } from '../repositories/productSalesSummary.repository'
import type { ProductDTO } from '../domain/products/product.types'

const timestamp = '2026-01-01T00:00:00Z'

const patient: PatientDTO = {
  active: true,
  birthDate: '1990-01-01',
  createdAt: timestamp,
  id: 'patient-1',
  name: 'Maria Silva',
  notes: null,
  phone: '(11) 99999-9999',
  updatedAt: timestamp,
}

const professional: ProfessionalDTO = {
  active: true,
  createdAt: timestamp,
  defaultClinicFeePercentage: 30,
  id: 'professional-1',
  name: 'Ana Costa',
  phone: '(11) 98888-8888',
  pixKey: 'ana@example.com',
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

const product: ProductDTO = {
  averageCost: 62,
  category: 'Oleos',
  currentStock: 1,
  createdAt: timestamp,
  id: 'product-1',
  imageUrl: null,
  internalCode: 'PROD-001',
  minimumStock: 2,
  name: 'Lavanda',
  notes: null,
  salePrice: 94.5,
  salePriceOpen: false,
  size: '5ml',
  status: 'active',
  unit: 'un',
  updatedAt: timestamp,
}

function makeAppointment(): AppointmentDTO {
  const date = new Date()
  const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

  return {
    appointmentDate: dateKey,
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

function expectTouchTarget(element: Element | null) {
  expect(element).not.toBeNull()
  expect(element?.className).toContain('min-h-11')
}

function expectMobileDirectory(container: HTMLElement) {
  const mobileCards = Array.from(container.querySelectorAll('div')).find(
    (element) => element.classList.contains('md:hidden') || element.classList.contains('lg:hidden'),
  )

  expect(mobileCards).not.toBeUndefined()
  expect(mobileCards?.querySelector('table')).toBeNull()
  expectTouchTarget(container.querySelector('input[type="search"]'))
  expectTouchTarget(container.querySelector('select'))

  const actions = container.querySelectorAll(
    'button[aria-label^="Editar"], button[aria-label^="Historico"], button[aria-label^="Inativar"]',
  )

  expect(actions.length).toBeGreaterThan(0)
  actions.forEach((action) => expectTouchTarget(action))
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('matchMedia', () => ({
    addEventListener: vi.fn(),
    matches: false,
    removeEventListener: vi.fn(),
  }))
  vi.mocked(appointmentRepository.list).mockResolvedValue([makeAppointment()])
  vi.mocked(patientRepository.list).mockResolvedValue([patient])
  vi.mocked(professionalRepository.list).mockResolvedValue([professional])
  vi.mocked(serviceRepository.list).mockResolvedValue([service])
  vi.mocked(productRepository.list).mockResolvedValue([product])
  vi.mocked(productRepository.getSummary).mockResolvedValue({
    activeProductsCount: 1,
    inventoryValue: 62,
    lowStockCount: 1,
    pendingDataCount: 0,
    periodGrossProfit: 32.5,
    periodReceived: 94.5,
    periodRevenue: 94.5,
    receivedByPaymentMethod: { card: 0, cash: 0, pix: 94.5 },
    zeroStockCount: 0,
  })
  vi.mocked(productSalesSummaryRepository.getByProduct).mockResolvedValue([])
})

afterEach(() => {
  mounted.forEach(({ container, root }) => {
    act(() => root.unmount())
    container.remove()
  })
  mounted = []
  vi.clearAllMocks()
})

describe('telas complementares no mobile', () => {
  it('mantém os campos de login confortáveis para toque e leitura no iPhone', () => {
    const container = renderNode(<LoginPage />)

    expectTouchTarget(container.querySelector('#email'))
    expectTouchTarget(container.querySelector('#password'))
    expectTouchTarget(container.querySelector('button[type="submit"]'))
    expect(container.querySelector('#email')?.className).toContain('text-base')
    expect(container.querySelector('#password')?.className).toContain('text-base')
  })

  it('prioriza o resumo do dashboard sem criar rolagem horizontal', async () => {
    const container = renderQueryNode(<DashboardPage />)
    await settleQueries()

    expect(container.querySelector('section.grid-cols-2')).not.toBeNull()
    expect(container.querySelector('[class*="overflow-x"]')).toBeNull()
    expect(container.querySelector('table')).toBeNull()
    expect(container.textContent).toContain('Atendimentos de hoje')
  })

  it('mantém pacientes em cards e filtros tocáveis no mobile', async () => {
    const container = renderQueryNode(<PatientsPage />)
    await settleQueries()

    expectMobileDirectory(container)
  })

  it('mantém profissionais em cards e filtros tocáveis no mobile', async () => {
    const container = renderQueryNode(<ProfessionalsPage />)
    await settleQueries()

    expectMobileDirectory(container)
  })

  it('mantém serviços em cards e filtros tocáveis no mobile', async () => {
    const container = renderQueryNode(<ServicesPage />)
    await settleQueries()

    expectMobileDirectory(container)
  })

  it('mantém produtos em cards, filtros e ações tocáveis no mobile', async () => {
    const container = renderQueryNode(<ProductsPage />)
    await settleQueries()

    const mobileCards = Array.from(container.querySelectorAll('div')).find(
      (element) =>
        element.classList.contains('lg:hidden') &&
        element.querySelector('h3'),
    )

    expect(mobileCards).not.toBeUndefined()
    expect(mobileCards?.querySelector('table')).toBeNull()
    expect(container.querySelector('input[type="search"]')?.className).toContain(
      'min-h-11',
    )

    const selects = Array.from(container.querySelectorAll('select'))
    expect(selects).toHaveLength(4)
    selects.forEach((select) => expectTouchTarget(select))

    const actions = container.querySelectorAll(
      'button[aria-label^="Editar"], button[aria-label^="Ver historico"], button[aria-label^="Registrar"], button[aria-label^="Inativar"]',
    )

    expect(actions.length).toBeGreaterThan(0)
    actions.forEach((action) => expectTouchTarget(action))
    expect(container.querySelector('table')).not.toBeNull()
  })
})
