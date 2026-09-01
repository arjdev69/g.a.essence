// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppointmentDTO } from '../domain/appointments/appointment.types'
import type { PatientDTO } from '../domain/patients/patient.types'
import type { ProfessionalDTO } from '../domain/professionals/professional.types'
import type { ServiceDTO } from '../domain/services/service.types'
import { getAppointmentMonthRange } from '../utils/appointmentPeriod'

vi.mock('../repositories/appointment.repository', () => ({
  appointmentRepository: {
    create: vi.fn(),
    list: vi.fn(),
    remove: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('../repositories/patient.repository', () => ({
  patientRepository: {
    list: vi.fn(),
  },
}))

vi.mock('../repositories/professional.repository', () => ({
  professionalRepository: {
    list: vi.fn(),
  },
}))

vi.mock('../repositories/service.repository', () => ({
  serviceRepository: {
    list: vi.fn(),
  },
}))

vi.mock('../repositories/calendar.repository', () => ({
  uploadAppointmentCalendarFile: vi.fn(),
}))

import { AppointmentsPage } from '../features/appointments/AppointmentsPage'
import { appointmentRepository } from '../repositories/appointment.repository'
import { patientRepository } from '../repositories/patient.repository'
import { professionalRepository } from '../repositories/professional.repository'
import { serviceRepository } from '../repositories/service.repository'

const currentMonth = new Date()
const currentMonthSelection = {
  month: currentMonth.getMonth() + 1,
  year: currentMonth.getFullYear(),
}
const currentMonthRange = getAppointmentMonthRange(
  currentMonthSelection.year,
  currentMonthSelection.month,
)

const patients: PatientDTO[] = [
  {
    active: true,
    birthDate: null,
    createdAt: '2026-01-01T00:00:00Z',
    id: 'patient-1',
    name: 'Maria Silva',
    notes: null,
    phone: null,
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    active: true,
    birthDate: null,
    createdAt: '2026-01-01T00:00:00Z',
    id: 'patient-2',
    name: 'João Costa',
    notes: null,
    phone: null,
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

const professionals: ProfessionalDTO[] = [
  {
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    defaultClinicFeePercentage: 30,
    id: 'professional-1',
    name: 'Ana Costa',
    phone: null,
    pixKey: null,
    specialty: 'Massoterapia',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

const services: ServiceDTO[] = [
  {
    active: true,
    clinicFeePercentage: 30,
    createdAt: '2026-01-01T00:00:00Z',
    defaultValue: 110,
    durationMinutes: 60,
    id: 'service-1',
    name: 'Massagem relaxante',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    active: true,
    clinicFeePercentage: 30,
    createdAt: '2026-01-01T00:00:00Z',
    defaultValue: 130,
    durationMinutes: 60,
    id: 'service-2',
    name: 'Drenagem linfática',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

const appointments: AppointmentDTO[] = [
  {
    appointmentDate: currentMonthRange.dateFrom,
    appointmentTime: '09:00:00',
    clinicFeePercentage: 30,
    clinicFeeValue: 33,
    createdAt: '2026-01-01T00:00:00Z',
    description: null,
    id: 'appointment-1',
    notes: null,
    patientId: 'patient-1',
    patientName: 'Maria Silva',
    professionalGainValue: 77,
    professionalId: 'professional-1',
    professionalName: 'Ana Costa',
    serviceId: 'service-1',
    serviceName: 'Massagem relaxante',
    status: 'completed',
    updatedAt: '2026-01-01T00:00:00Z',
    value: 110,
  },
  {
    appointmentDate: currentMonthRange.dateTo,
    appointmentTime: '14:00:00',
    clinicFeePercentage: 30,
    clinicFeeValue: 39,
    createdAt: '2026-01-01T00:00:00Z',
    description: null,
    id: 'appointment-2',
    notes: null,
    patientId: 'patient-2',
    patientName: 'João Costa',
    professionalGainValue: 91,
    professionalId: 'professional-1',
    professionalName: 'Ana Costa',
    serviceId: 'service-2',
    serviceName: 'Drenagem linfática',
    status: 'scheduled',
    updatedAt: '2026-01-01T00:00:00Z',
    value: 130,
  },
]

let mountedRoot: Root | null = null
let mountedContainer: HTMLDivElement | null = null

function renderAppointments() {
  const container = document.createElement('div')
  const root = createRoot(container)
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  mountedContainer = container
  mountedRoot = root
  document.body.appendChild(container)

  act(() => {
    root.render(
      <QueryClientProvider client={queryClient}>
        <AppointmentsPage />
      </QueryClientProvider>,
    )
  })

  return container
}

async function settleQueries() {
  await act(async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 20))
  })
}

function changeInput(element: HTMLInputElement, value: string) {
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set
    setter?.call(element, value)
    element.dispatchEvent(new Event('input', { bubbles: true }))
    element.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

function changeSelect(element: HTMLSelectElement, value: string) {
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLSelectElement.prototype,
      'value',
    )?.set
    setter?.call(element, value)
    element.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.mocked(appointmentRepository.list).mockImplementation(async (filters) =>
    appointments.filter(
      (appointment) =>
        (!filters?.dateFrom || appointment.appointmentDate >= filters.dateFrom) &&
        (!filters?.dateTo || appointment.appointmentDate <= filters.dateTo) &&
        (!filters?.patientId || appointment.patientId === filters.patientId) &&
        (!filters?.professionalId ||
          appointment.professionalId === filters.professionalId) &&
        (!filters?.serviceId || appointment.serviceId === filters.serviceId) &&
        (!filters?.status || appointment.status === filters.status),
    ),
  )
  vi.mocked(patientRepository.list).mockResolvedValue(patients)
  vi.mocked(professionalRepository.list).mockResolvedValue(professionals)
  vi.mocked(serviceRepository.list).mockResolvedValue(services)
  vi.mocked(appointmentRepository.remove).mockResolvedValue(undefined)
})

afterEach(() => {
  if (mountedRoot) {
    act(() => {
      mountedRoot?.unmount()
    })
  }

  mountedContainer?.remove()
  mountedRoot = null
  mountedContainer = null
  vi.clearAllMocks()
})

describe('appointments mobile filters', () => {
  it('starts in the current month and applies search and status without reload', async () => {
    const container = renderAppointments()
    await settleQueries()

    expect(
      vi.mocked(appointmentRepository.list).mock.calls[0]?.[0],
    ).toEqual(
      expect.objectContaining({
        dateFrom: currentMonthRange.dateFrom,
        dateTo: currentMonthRange.dateTo,
      }),
    )
    expect(container.textContent).toContain('2 atendimentos encontrados')

    const search = container.querySelector<HTMLInputElement>(
      '#appointment-search',
    )
    expect(search).not.toBeNull()
    changeInput(search!, 'Maria')
    await settleQueries()

    expect(container.textContent).toContain('1 atendimento encontrado')
    expect(container.textContent).toContain('Maria Silva')
    expect(container.textContent).not.toContain('João Costa')
    expect(vi.mocked(appointmentRepository.list)).toHaveBeenCalledTimes(1)

    const status = container.querySelector<HTMLSelectElement>(
      '#appointment-status',
    )
    changeSelect(status!, 'scheduled')
    await settleQueries()

    expect(container.textContent).toContain('Nenhum atendimento encontrado.')
    expect(container.textContent).toContain('Ajuste ou limpe os filtros')
    expect(vi.mocked(appointmentRepository.list).mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({ status: 'scheduled' }),
    )
  })

  it('navigates months, validates custom periods and preserves the last query', async () => {
    const container = renderAppointments()
    await settleQueries()

    const nextMonthButton = container.querySelector<HTMLButtonElement>(
      '[aria-label="Próximo mês"]',
    )
    act(() => nextMonthButton?.click())
    await settleQueries()

    const nextMonth = new Date(
      Date.UTC(
        currentMonthSelection.year,
        currentMonthSelection.month,
        1,
      ),
    )
    const nextMonthRange = getAppointmentMonthRange(
      nextMonth.getUTCFullYear(),
      nextMonth.getUTCMonth() + 1,
    )
    expect(vi.mocked(appointmentRepository.list).mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining(nextMonthRange),
    )

    const customPeriodButton = Array.from(
      container.querySelectorAll('button'),
    ).find((button) => button.textContent?.includes('Escolher período'))
    act(() => customPeriodButton?.click())
    const dateFrom = container.querySelector<HTMLInputElement>(
      '#appointment-date-from',
    )
    const dateTo = container.querySelector<HTMLInputElement>(
      '#appointment-date-to',
    )
    expect(dateFrom?.value).toBe(nextMonthRange.dateFrom)
    expect(dateTo?.value).toBe(nextMonthRange.dateTo)

    changeInput(dateFrom!, nextMonthRange.dateTo)
    await settleQueries()
    const callsAfterValidCustomRange = vi.mocked(appointmentRepository.list)
      .mock.calls.length

    changeInput(dateFrom!, `${nextMonth.getUTCFullYear() + 1}-01-01`)
    await settleQueries()

    expect(container.textContent).toContain(
      'A data inicial deve ser anterior ou igual à data final.',
    )
    expect(vi.mocked(appointmentRepository.list)).toHaveBeenCalledTimes(
      callsAfterValidCustomRange,
    )
    expect(vi.mocked(appointmentRepository.list).mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({
        dateFrom: nextMonthRange.dateTo,
        dateTo: nextMonthRange.dateTo,
      }),
    )
  })

  it('expands secondary filters, exposes chips and clears every filter', async () => {
    const container = renderAppointments()
    await settleQueries()

    const moreFiltersButton = Array.from(
      container.querySelectorAll('button'),
    ).find((button) => button.textContent?.includes('Mais filtros'))
    act(() => moreFiltersButton?.click())

    const patient = container.querySelector<HTMLSelectElement>(
      '#appointment-patient',
    )
    changeSelect(patient!, 'patient-2')
    await settleQueries()

    expect(
      container.querySelector(
        '[aria-label="Remover filtro Paciente: João Costa"]',
      ),
    ).not.toBeNull()
    expect(container.textContent).toContain('1 atendimento encontrado')

    const clearButton = container.querySelector<HTMLButtonElement>(
      '[aria-label="Limpar filtros da agenda"]',
    )
    act(() => clearButton?.click())
    await settleQueries()

    expect(container.querySelector('#appointment-more-filters')).toBeNull()
    act(() => moreFiltersButton?.click())
    expect(
      container.querySelector<HTMLSelectElement>('#appointment-patient')?.value,
    ).toBe('all')
    expect(container.querySelector<HTMLInputElement>('#appointment-search')?.value)
      .toBe('')
    expect(
      container.querySelector<HTMLSelectElement>('#appointment-status')?.value,
    ).toBe('all')
    expect(container.textContent).toContain('2 atendimentos encontrados')
  })

  it('mantem Editar visivel e confirma a remocao pelo menu do card', async () => {
    const container = renderAppointments()
    await settleQueries()

    expect(
      container.querySelector(
        '[aria-label="Editar atendimento de Maria Silva"]',
      ),
    ).not.toBeNull()

    const actionsTrigger = container.querySelector<HTMLButtonElement>(
      '[aria-label="Mais ações para Maria Silva"]',
    )
    act(() => actionsTrigger?.click())

    const menu = container.querySelector('[role="menu"]')
    expect(actionsTrigger?.getAttribute('aria-expanded')).toBe('true')
    expect(menu?.textContent).toContain('Adicionar ao calendario')
    expect(menu?.textContent).toContain('Remover')

    const removeItem = menu?.querySelector<HTMLButtonElement>(
      '[role="menuitem"]:last-child',
    )
    act(() => removeItem?.click())

    expect(container.textContent).toContain(
      'Esta ação não pode ser desfeita.',
    )
    const cancelButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Cancelar',
    )
    act(() => cancelButton?.click())
    expect(container.querySelector('[role="dialog"]')).toBeNull()

    act(() => actionsTrigger?.click())
    const reopenedMenu = container.querySelector('[role="menu"]')
    const reopenedRemoveItem = reopenedMenu?.querySelector<HTMLButtonElement>(
      '[role="menuitem"]:last-child',
    )
    act(() => reopenedRemoveItem?.click())
    const confirmButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Remover atendimento',
    )
    act(() => confirmButton?.click())
    await settleQueries()

    expect(vi.mocked(appointmentRepository.remove)).toHaveBeenCalledWith(
      'appointment-1',
    )
    expect(container.querySelector('[role="dialog"]')).toBeNull()
    expect(container.textContent).toContain('Atendimento removido com sucesso.')
  })
})
