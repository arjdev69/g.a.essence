// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, useLocation, useNavigate } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppLayout } from '../components/layout/AppLayout'

vi.mock('../features/auth/LogoutButton', () => ({
  LogoutButton: () => (
    <button type="button">Sair</button>
  ),
}))

vi.mock('../features/pwa/AppointmentNotificationsButton', () => ({
  AppointmentNotificationsButton: () => null,
}))

vi.mock('../features/pwa/AppointmentNotificationsScheduler', () => ({
  AppointmentNotificationsScheduler: () => null,
}))

vi.mock('../features/pwa/InstallPwaButton', () => ({
  InstallPwaButton: () => null,
}))

let mountedRoot: Root | null = null
let mountedContainer: HTMLDivElement | null = null

function RouteProbe() {
  const location = useLocation()

  return <span data-current-route>{location.pathname}</span>
}

function RouteChangeButton() {
  const navigate = useNavigate()

  return (
    <button type="button" data-route-change onClick={() => navigate('/reports')}>
      Trocar rota
    </button>
  )
}

function renderLayout() {
  const container = document.createElement('div')
  const root = createRoot(container)

  mountedContainer = container
  mountedRoot = root
  document.body.appendChild(container)

  act(() => {
    root.render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppLayout title="Dashboard">
          <RouteProbe />
          <RouteChangeButton />
        </AppLayout>
      </MemoryRouter>,
    )
  })

  return container
}

function getMobileTrigger(container: HTMLElement) {
  return container.querySelector<HTMLButtonElement>(
    '[aria-controls="mobile-navigation-drawer"]',
  )
}

function getMobileDrawer(container: HTMLElement) {
  return container.querySelector<HTMLElement>('#mobile-navigation-drawer')
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
  document.body.style.overflow = ''
})

describe('mobile navigation drawer', () => {
  it('mantem sidebar desktop e remove o menu fixo do rodape', () => {
    const container = renderLayout()
    const desktopAside = container.querySelector('aside')
    const main = container.querySelector('main')

    expect(desktopAside?.className).toContain('lg:flex')
    expect(container.querySelector('nav.fixed')).toBeNull()
    expect(main?.className).not.toContain('pb-24')
    expect(getMobileDrawer(container)).toBeNull()
  })

  it('confina Tab, fecha com Escape e restaura o foco do acionador', () => {
    const container = renderLayout()
    const trigger = getMobileTrigger(container)

    expect(trigger).not.toBeNull()
    trigger?.focus()

    act(() => {
      trigger?.click()
    })

    const drawer = getMobileDrawer(container)
    const closeButton = drawer?.querySelector<HTMLButtonElement>(
      '[data-mobile-drawer-close]',
    )
    const focusableElements = drawer
      ? Array.from(
          drawer.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        )
      : []
    const firstFocusableElement = focusableElements[0]
    const lastFocusableElement = focusableElements.at(-1)

    expect(drawer?.getAttribute('role')).toBe('dialog')
    expect(drawer?.getAttribute('aria-modal')).toBe('true')
    expect(trigger?.getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(closeButton)
    expect(document.body.style.overflow).toBe('hidden')
    expect(firstFocusableElement).toBe(closeButton)
    expect(lastFocusableElement).not.toBeUndefined()

    act(() => {
      lastFocusableElement?.focus()
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Tab',
        }),
      )
    })
    expect(document.activeElement).toBe(firstFocusableElement)

    act(() => {
      firstFocusableElement?.focus()
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Tab',
          shiftKey: true,
        }),
      )
    })
    expect(document.activeElement).toBe(lastFocusableElement)

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Escape',
        }),
      )
    })

    expect(getMobileDrawer(container)).toBeNull()
    expect(trigger?.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
    expect(document.body.style.overflow).toBe('')
  })

  it('fecha pelo backdrop, pelo botao Fechar e ao trocar de rota', () => {
    const container = renderLayout()
    const trigger = getMobileTrigger(container)

    act(() => {
      trigger?.click()
    })
    const backdrop = container.querySelector<HTMLButtonElement>(
      '[data-mobile-drawer-backdrop]',
    )

    act(() => {
      backdrop?.click()
    })
    expect(getMobileDrawer(container)).toBeNull()

    act(() => {
      trigger?.click()
    })
    const closeButton = container.querySelector<HTMLButtonElement>(
      '[data-mobile-drawer-close]',
    )

    act(() => {
      closeButton?.click()
    })
    expect(getMobileDrawer(container)).toBeNull()

    act(() => {
      trigger?.click()
    })
    const routeChangeButton = container.querySelector<HTMLButtonElement>(
      '[data-route-change]',
    )

    act(() => {
      routeChangeButton?.click()
    })

    expect(container.querySelector('[data-current-route]')?.textContent).toBe(
      '/reports',
    )
    expect(getMobileDrawer(container)).toBeNull()
  })
})
