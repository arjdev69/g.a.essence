import { Menu, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { LogoutButton } from '../../features/auth/LogoutButton'
import { AppointmentNotificationsButton } from '../../features/pwa/AppointmentNotificationsButton'
import { AppointmentNotificationsScheduler } from '../../features/pwa/AppointmentNotificationsScheduler'
import { InstallPwaButton } from '../../features/pwa/InstallPwaButton'
import { MainMenu } from './MainMenu'

type AppLayoutProps = {
  title: string
  action?: ReactNode
  children: ReactNode
}

export function AppLayout({ title, action, children }: AppLayoutProps) {
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-stone-50 text-zinc-950">
      <AppointmentNotificationsScheduler />
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-stone-200 bg-white lg:flex">
        <div className="border-b border-stone-200 p-6">
          <h1 className="text-xl font-semibold text-emerald-700">
            G.A Essência
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Geane Araújo Massoterapeuta
          </p>
        </div>

        <MainMenu variant="desktop" />

        <div className="border-t border-stone-200 p-4">
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-stone-200 bg-white px-4 py-3 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-stone-300 bg-white text-zinc-800 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 lg:hidden"
              aria-controls="mobile-navigation-drawer"
              aria-expanded={isMobileNavigationOpen}
              aria-label="Abrir menu principal"
              onClick={() => setIsMobileNavigationOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <p className="text-xs font-medium text-emerald-700 lg:hidden">
              G.A Essência
            </p>
            <h2 className="min-w-0 truncate text-xl font-semibold">{title}</h2>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-2">
            <AppointmentNotificationsButton />
            <InstallPwaButton />
            {action}
          </div>
        </header>

        {isMobileNavigationOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-zinc-950/40"
              aria-label="Fechar menu principal"
              onClick={() => setIsMobileNavigationOpen(false)}
            />
            <aside
              id="mobile-navigation-drawer"
              className="relative flex h-full w-[min(86vw,320px)] max-w-full flex-col overflow-y-auto bg-white shadow-2xl"
              aria-label="Menu principal"
            >
              <div
                className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4"
                style={{
                  paddingTop: 'max(1rem, env(safe-area-inset-top))',
                }}
              >
                <div>
                  <p className="text-base font-semibold text-emerald-700">
                    G.A Essência
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Menu principal
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-stone-300 bg-white text-zinc-800 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
                  aria-label="Fechar menu principal"
                  onClick={() => setIsMobileNavigationOpen(false)}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <MainMenu
                variant="mobile"
                onNavigate={() => setIsMobileNavigationOpen(false)}
              />

              <div
                className="border-t border-stone-200 px-5 py-4"
                style={{
                  paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
                }}
              >
                <LogoutButton />
              </div>
            </aside>
          </div>
        ) : null}

        <main className="min-h-0 flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
