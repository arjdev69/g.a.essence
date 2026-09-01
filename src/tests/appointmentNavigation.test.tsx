// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppointmentDTO } from '../domain/appointments/appointment.types'
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

const now = new Date()
const currentMonthRange = getAppointmentMonthRange(
  now.getFullYear(),
  now.getMonth() + 1,
)

function makeAppointment(
  input: Partial<AppointmentDTO> = {},
): AppointmentDTO {
  return {
    appointmentDate: input.appointmentDate ?? currentMonthRange.dateFrom,
    appointmentTime: input.appointmentTime ?? '09:00:00',
    clinicFeePercentage: input.clinicFeePercentage ?? 30,
    clinicFeeValue: input.clinicFeeValue ?? 33,
    createdAt: input.createdAt ?? '2026-01-01T00:00:00Z',
    description: input.description ?? null,
    id: input.id ?? 'appointment-1',
    notes: input.notes ?? null,
    patientId: input.patientId ?? 'patient-1',
    patientName: input.patientName ?? 'Maria Silva',
    professionalGainValue: input.professionalGainValue ?? 77,
    professionalId: input.professionalId ?? 'professional-1',
    professionalName: input.professionalName ?? 'Ana Costa',
    serviceId: input.serviceId ?? 'service-1',
    serviceName: input.serviceName ?? 'Massagem relaxante',
    status: input.status ?? 'completed',
    updatedAt: input.updatedAt ?? '2026-01-01T00:00:00Z',
    value: input.value ?? 110,
  }
}

const appointments = [
  makeAppointment(),
  makeAppointment({
    appointmentDate: currentMonthRange.dateTo,
    appointmentTime: '14:00:00',
    clinicFeeValue: 0,
    id: 'appointment-2',
    patientId: 'patient-2',
    patientName: 'João Costa',
    professionalGainValue: 0,
    serviceId: 'service-2',
    serviceName: 'Drenagem linfática',
    status: 'cancelled',
    value: 130,
  }),
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

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.mocked(appointmentRepository.list).mockResolvedValue(appointments)
  vi.mocked(patientRepository.list).mockResolvedValue([])
  vi.mocked(professionalRepository.list).mockResolvedValue([])
  vi.mocked(serviceRepository.list).mockResolvedValue([])
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

describe('appointments mobile cards', () => {
  it('renderiza cards completos no mobile e tabela isolada no desktop', async () => {
    const container = renderAppointments()
    await settleQueries()

    const cardList = Array.from(container.querySelectorAll('div')).find(
      (element) => element.classList.contains('xl:hidden'),
    )
    const tableList = Array.from(container.querySelectorAll('div')).find(
      (element) =>
        element.classList.contains('hidden') &&
        element.classList.contains('xl:block'),
    )

    expect(cardList).not.toBeUndefined()
    expect(tableList).not.toBeUndefined()
    expect(cardList?.textContent).toContain('Maria Silva')
    expect(cardList?.textContent).toContain('Massagem relaxante')
    expect(cardList?.textContent).toContain('Ana Costa')
    expect(cardList?.textContent).toContain('Realizado')
    expect(cardList?.textContent).toContain('Cancelado')
    expect(cardList?.textContent).toContain('Valor total')
    expect(cardList?.textContent).toContain('Divisao')
    const editButton = cardList?.querySelector<HTMLButtonElement>(
      '[aria-label="Editar atendimento de Maria Silva"]',
    )
    const moreActionsButton = cardList?.querySelector<HTMLButtonElement>(
      '[aria-label="Mais ações para Maria Silva"]',
    )

    expect(editButton).not.toBeNull()
    expect(editButton?.className).toContain('min-h-11')
    expect(moreActionsButton).not.toBeNull()
    expect(moreActionsButton?.className).toContain('min-h-11')
    expect(moreActionsButton?.className).toContain('min-w-11')
  })

  it('abre a edição pelo botão visível do card sem depender de hover', async () => {
    const container = renderAppointments()
    await settleQueries()

    const cardList = Array.from(container.querySelectorAll('div')).find(
      (element) => element.classList.contains('xl:hidden'),
    )
    const editButton = cardList?.querySelector<HTMLButtonElement>(
      '[aria-label="Editar atendimento de Maria Silva"]',
    )

    act(() => editButton?.click())
    await settleQueries()

    expect(container.querySelector('[role="dialog"] h2')?.textContent).toBe(
      'Editar atendimento',
    )
    expect(container.querySelector('[role="dialog"]')).not.toBeNull()
  })
})
