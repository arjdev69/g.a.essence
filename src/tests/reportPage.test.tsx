// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as axe from 'axe-core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppointmentDTO, AppointmentStatus } from '../domain/appointments'
import { getAppointmentMonthRange } from '../utils/appointmentPeriod'

vi.mock('../repositories/appointment.repository', () => ({
  appointmentRepository: {
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

vi.mock('../services/export/downloadFile', () => ({
  downloadFile: vi.fn(),
}))

import { ReportsPage } from '../features/reports/ReportsPage'
import { appointmentRepository } from '../repositories/appointment.repository'
import { professionalRepository } from '../repositories/professional.repository'
import { serviceRepository } from '../repositories/service.repository'
import { downloadFile } from '../services/export/downloadFile'

const now = new Date()
const currentMonthRange = getAppointmentMonthRange(
  now.getFullYear(),
  now.getMonth() + 1,
)

function makeAppointment(
  status: AppointmentStatus,
  input: Partial<AppointmentDTO> = {},
): AppointmentDTO {
  return {
    appointmentDate: input.appointmentDate ?? currentMonthRange.dateFrom,
    appointmentTime: input.appointmentTime ?? '09:00:00',
    clinicFeePercentage: input.clinicFeePercentage ?? 30,
    clinicFeeValue: input.clinicFeeValue ?? 33,
    createdAt: input.createdAt ?? '2026-01-01T00:00:00Z',
    description: input.description ?? null,
    id: input.id ?? `appointment-${status}`,
    notes: input.notes ?? null,
    patientId: input.patientId ?? 'patient-1',
    patientName: input.patientName ?? `Paciente ${status}`,
    professionalGainValue: input.professionalGainValue ?? 77,
    professionalId: input.professionalId ?? 'professional-1',
    professionalName: input.professionalName ?? 'Ana Costa',
    serviceId: input.serviceId ?? 'service-1',
    serviceName: input.serviceName ?? 'Massagem relaxante',
    status,
    updatedAt: input.updatedAt ?? '2026-01-01T00:00:00Z',
    value: input.value ?? 110,
  }
}

const appointments = [
  makeAppointment('scheduled'),
  makeAppointment('completed', { id: 'appointment-completed' }),
  makeAppointment('paid', { id: 'appointment-paid', value: 160, clinicFeeValue: 48, professionalGainValue: 112 }),
  makeAppointment('cancelled', { id: 'appointment-cancelled' }),
  makeAppointment('no_show', { id: 'appointment-no-show' }),
]

let mountedRoot: Root | null = null
let mountedContainer: HTMLDivElement | null = null

function renderReports(clearFiltersRequest = 0) {
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
        <ReportsPage clearFiltersRequest={clearFiltersRequest} />
      </QueryClientProvider>,
    )
  })

  return { container, root }
}

async function settleQueries() {
  await act(async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 30))
  })
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.mocked(appointmentRepository.list).mockResolvedValue(appointments)
  vi.mocked(professionalRepository.list).mockResolvedValue([
    {
      active: true,
      createdAt: '2026-01-01T00:00:00Z',
      defaultClinicFeePercentage: 30,
      id: 'professional-1',
      name: 'Ana Costa',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ])
  vi.mocked(serviceRepository.list).mockResolvedValue([
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
  ])
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

describe('reports mobile and filters', () => {
  it('não apresenta violações axe críticas ou sérias no estado completo', async () => {
    const { container } = renderReports()
    await settleQueries()

    const results = await axe.run(container)
    const seriousViolations = results.violations.filter((violation) =>
      violation.impact === 'critical' || violation.impact === 'serious',
    )

    expect(seriousViolations).toEqual([])
  }, 15000)

  it('expõe labels, estado de carregamento e estado vazio por filtro', async () => {
    vi.mocked(appointmentRepository.list).mockImplementation(
      () => new Promise(() => {}),
    )
    vi.mocked(professionalRepository.list).mockImplementation(
      () => new Promise(() => {}),
    )
    vi.mocked(serviceRepository.list).mockImplementation(
      () => new Promise(() => {}),
    )

    const { container } = renderReports()

    expect(container.querySelector('[role="status"]')).not.toBeNull()
    expect(container.querySelector('label[for="report-status"]')).not.toBeNull()

    if (mountedRoot) {
      act(() => {
        mountedRoot?.unmount()
      })
      mountedContainer?.remove()
      mountedRoot = null
      mountedContainer = null
    }

    vi.mocked(appointmentRepository.list).mockResolvedValue([
      makeAppointment('completed'),
    ])
    vi.mocked(professionalRepository.list).mockResolvedValue([
      {
        active: true,
        createdAt: '2026-01-01T00:00:00Z',
        defaultClinicFeePercentage: 30,
        id: 'professional-1',
        name: 'Ana Costa',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ])
    vi.mocked(serviceRepository.list).mockResolvedValue([
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
    ])
    const emptyView = renderReports()
    await settleQueries()

    const statusSelect = emptyView.container.querySelector<HTMLSelectElement>(
      '#report-status',
    )
    act(() => {
      if (statusSelect) {
        statusSelect.value = 'scheduled'
        statusSelect.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })
    await settleQueries()

    expect(emptyView.container.textContent).toContain(
      'Nenhum atendimento encontrado para estes filtros.',
    )
    expect(
      Array.from(emptyView.container.querySelectorAll('button')).some(
        (button) => button.textContent === 'Limpar filtros',
      ),
    ).toBe(true)
  })

  it('mostra erro recuperável e restaura o relatório após tentar novamente', async () => {
    vi.mocked(appointmentRepository.list).mockRejectedValueOnce(
      new Error('network failed'),
    )
    const { container } = renderReports()
    await settleQueries()

    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      'Nao foi possivel carregar o relatorio.',
    )
    const retryButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Tentar novamente',
    )
    expect(retryButton).not.toBeUndefined()

    act(() => retryButton?.click())
    await settleQueries()

    expect(container.querySelector('[aria-label="Indicadores do relatório"]')).not.toBeNull()
    expect(container.querySelector('[role="alert"]')).toBeNull()
  })

  it('oferece todos os status, chips e indicadores coerentes com as linhas filtradas', async () => {
    const { container } = renderReports()
    await settleQueries()

    const statusSelect = container.querySelector<HTMLSelectElement>('#report-status')
    const indicatorSection = container.querySelector(
      '[aria-label="Indicadores do relatório"]',
    )
    const mobileRows = container.querySelector('.xl\\:hidden')

    expect(
      Array.from(statusSelect?.options ?? []).map((option) => option.textContent),
    ).toEqual(['Todos os status', 'Agendado', 'Realizado', 'Pago', 'Cancelado', 'Faltou'])
    expect(indicatorSection?.textContent).toContain('Total no período5')
    expect(indicatorSection?.textContent).toContain('Atendimentos financeiros2')
    expect(indicatorSection?.textContent).toContain('R$ 270,00')
    expect(mobileRows?.textContent).toContain('Agendado')
    expect(mobileRows?.textContent).toContain('Realizado')
    expect(mobileRows?.textContent).toContain('Pago')
    expect(mobileRows?.textContent).toContain('Cancelado')
    expect(mobileRows?.textContent).toContain('Faltou')

    act(() => {
      if (statusSelect) {
        statusSelect.value = 'scheduled'
        statusSelect.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })
    await settleQueries()

    const filteredIndicators = container.querySelector(
      '[aria-label="Indicadores do relatório"]',
    )
    const filteredRows = container.querySelector('.xl\\:hidden')

    expect(filteredIndicators?.textContent).toContain('Total no período1')
    expect(filteredIndicators?.textContent).toContain(
      'Atendimentos financeiros0',
    )
    expect(filteredIndicators?.textContent).toContain('R$ 0,00')
    expect(filteredRows?.textContent).toContain('Agendado')
    expect(filteredRows?.textContent).not.toContain('Realizado')
    expect(container.querySelector('[aria-label="Remover filtro Status: Agendado"]')).not.toBeNull()
    expect(vi.mocked(appointmentRepository.list)).toHaveBeenLastCalledWith({
      dateFrom: currentMonthRange.dateFrom,
      dateTo: currentMonthRange.dateTo,
      professionalId: undefined,
      serviceId: undefined,
      status: 'scheduled',
    })

    act(() => {
      container
        .querySelector<HTMLButtonElement>(
          '[aria-label="Remover filtro Status: Agendado"]',
        )
        ?.click()
    })
    await settleQueries()

    expect(statusSelect?.value).toBe('all')
    expect(
      container
        .querySelector('[aria-label="Indicadores do relatório"]')
        ?.textContent,
    ).toContain('Total no período5')
  })

  it('mantém cards mobile e tabela desktop separados e restaura filtros pelo pedido de limpeza', async () => {
    const { container, root } = renderReports()
    await settleQueries()

    expect(container.querySelector('.hidden.xl\\:block')).not.toBeNull()
    expect(container.querySelector('.grid.gap-3.xl\\:hidden')).not.toBeNull()
    expect(
      container.querySelector('[aria-label^="Remover filtro Período:"]'),
    ).not.toBeNull()

    const professionalSelect = container.querySelector<HTMLSelectElement>(
      '#report-professional',
    )
    act(() => {
      if (professionalSelect) {
        professionalSelect.value = 'professional-1'
        professionalSelect.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })
    await settleQueries()
    expect(
      container.querySelector('[aria-label="Remover filtro Profissional: Ana Costa"]'),
    ).not.toBeNull()

    act(() => {
      root.render(
        <QueryClientProvider
          client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
        >
          <ReportsPage clearFiltersRequest={1} />
        </QueryClientProvider>,
      )
    })
    await settleQueries()

    expect(container.querySelector<HTMLSelectElement>('#report-status')?.value).toBe('all')
    expect(container.querySelector<HTMLSelectElement>('#report-professional')?.value).toBe('all')
  })

  it('exporta exatamente o relatório filtrado e oferece nova tentativa quando o download falha', async () => {
    const { container, root } = renderReports()
    await settleQueries()

    act(() => {
      root.render(
        <QueryClientProvider
          client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
        >
          <ReportsPage exportRequest={1} />
        </QueryClientProvider>,
      )
    })
    await settleQueries()

    expect(downloadFile).toHaveBeenCalledWith({
      content: expect.stringContaining(
        'Data;Hora;Paciente;Servico;Profissional;Status;Valor;Clinica;Ganho profissional',
      ),
      filename: expect.stringMatching(/^relatorio-mensal-\d{4}-\d{2}\.csv$/),
      mimeType: 'text/csv;charset=utf-8',
    })
    expect(container.textContent).toContain('CSV exportado:')

    vi.mocked(downloadFile).mockImplementationOnce(() => {
      throw new Error('download failed')
    })
    act(() => {
      root.render(
        <QueryClientProvider
          client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
        >
          <ReportsPage exportRequest={2} />
        </QueryClientProvider>,
      )
    })
    await settleQueries()

    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      'Nao foi possivel gerar o arquivo CSV.',
    )
    const retryButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Tentar exportar novamente',
    )
    expect(retryButton).not.toBeUndefined()

    act(() => retryButton?.click())
    await settleQueries()

    expect(container.textContent).toContain('CSV exportado:')
    expect(vi.mocked(downloadFile).mock.calls.length).toBe(3)
  })
})
