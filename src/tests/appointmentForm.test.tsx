// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AppointmentFormData } from '../features/appointments/appointment.schema'
import { AppointmentForm } from '../features/appointments/AppointmentForm'

const patientOptions = [{ id: 'patient-1', name: 'Maria Silva' }]
const professionalOptions = [{ id: 'professional-1', name: 'Ana Costa' }]
const serviceOptions = [
  {
    clinicFeePercentage: 30,
    defaultValue: 110,
    id: 'service-1',
    name: 'Massagem relaxante',
  },
  {
    clinicFeePercentage: 40,
    defaultValue: 160,
    id: 'service-2',
    name: 'Drenagem linfática',
  },
]

const defaultValues: AppointmentFormData = {
  appointmentDate: '2026-09-01',
  appointmentTime: '09:00',
  clinicFeePercentage: 30,
  description: null,
  notes: null,
  patientId: 'patient-1',
  professionalId: 'professional-1',
  serviceId: 'service-1',
  status: 'scheduled',
  value: 110,
}

let mountedRoot: Root | null = null
let mountedContainer: HTMLDivElement | null = null

function renderForm(
  overrides: Partial<React.ComponentProps<typeof AppointmentForm>> = {},
) {
  const container = document.createElement('div')
  const root = createRoot(container)

  mountedRoot = root
  mountedContainer = container
  document.body.appendChild(container)

  act(() => {
    root.render(
      <AppointmentForm
        defaultValues={defaultValues}
        onSubmit={vi.fn()}
        patientOptions={patientOptions}
        professionalOptions={professionalOptions}
        serviceOptions={serviceOptions}
        {...overrides}
      />,
    )
  })

  return container
}

afterEach(() => {
  if (mountedRoot) {
    act(() => {
      mountedRoot?.unmount()
    })
  }

  mountedContainer?.remove()
  mountedRoot = null
  mountedContainer = null
})

describe('AppointmentForm mobile UX', () => {
  it('segue a ordem mobile, usa alvos de 44px e recalcula ao selecionar serviço', () => {
    const container = renderForm()
    const labels = Array.from(container.querySelectorAll('form label')).map(
      (label) => label.textContent,
    )

    expect(labels).toEqual([
      'Paciente',
      'Servico',
      'Profissional',
      'Data',
      'Hora',
      'Status',
      'Valor',
      'Percentual',
      'Observacoes',
    ])
    expect(
      Array.from(container.querySelectorAll('input, select')).every((field) =>
        field.className.includes('min-h-11'),
      ),
    ).toBe(true)
    expect(container.querySelector('textarea')?.className).toContain('text-base')
    expect(
      Array.from(container.querySelectorAll('button')).every((button) =>
        button.className.includes('min-h-11'),
      ),
    ).toBe(true)

    const serviceSelect = container.querySelector<HTMLSelectElement>('#serviceId')
    act(() => {
      if (serviceSelect) {
        serviceSelect.value = 'service-2'
        serviceSelect.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })

    expect(container.querySelector<HTMLInputElement>('#value')?.value).toBe('160')
    expect(
      container.querySelector<HTMLInputElement>('#clinicFeePercentage')?.value,
    ).toBe('40')
    expect(container.textContent).toContain('R$ 160,00')
    expect(container.textContent).toContain('R$ 64,00')
    expect(container.textContent).toContain('R$ 96,00')
  })

  it('desabilita o envio e impede uma segunda submissão enquanto a primeira aguarda', async () => {
    let resolveSubmit: (() => void) | undefined
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve
        }),
    )
    const container = renderForm({ onSubmit })
    const submitButton = container.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    )

    act(() => submitButton?.click())
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 0))
    })

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(submitButton?.disabled).toBe(true)

    act(() => submitButton?.click())
    expect(onSubmit).toHaveBeenCalledTimes(1)

    act(() => resolveSubmit?.())
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 0))
    })
    expect(submitButton?.disabled).toBe(false)
  })
})
