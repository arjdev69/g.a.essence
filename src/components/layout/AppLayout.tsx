import type { ReactNode } from 'react'
import { LogoutButton } from '../../features/auth/LogoutButton'
import { InstallPwaButton } from '../../features/pwa/InstallPwaButton'
import { MainMenu } from './MainMenu'

type AppLayoutProps = {
  title: string
  action?: ReactNode
  children: ReactNode
}

export function AppLayout({ title, action, children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-stone-50 text-zinc-950">
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
          <div className="min-w-0">
            <p className="text-xs font-medium text-emerald-700 lg:hidden">
              G.A Essência
            </p>
            <h2 className="truncate text-xl font-semibold">{title}</h2>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-2">
            <InstallPwaButton />
            {action}
          </div>
        </header>

        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white px-2 py-2 shadow-[0_-8px_24px_rgba(24,24,27,0.08)] lg:hidden"
          aria-label="Principal"
        >
          <MainMenu variant="mobile" />
        </nav>

        <main className="min-h-0 flex-1 overflow-auto p-4 pb-24 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
