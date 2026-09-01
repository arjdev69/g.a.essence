import {
  BarChart3,
  Briefcase,
  CalendarDays,
  LayoutDashboard,
  UserCheck,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router'

const navigationItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/appointments', label: 'Atendimentos', icon: CalendarDays },
  { path: '/patients', label: 'Pacientes', icon: Users },
  { path: '/professionals', label: 'Profissionais', icon: UserCheck },
  { path: '/services', label: 'Serviços', icon: Briefcase },
  { path: '/reports', label: 'Relatórios', icon: BarChart3 },
]

function getDesktopNavLinkClass({ isActive }: { isActive: boolean }) {
  return [
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
    isActive
      ? 'bg-emerald-50 font-medium text-emerald-800'
      : 'text-zinc-800 hover:bg-stone-100',
  ].join(' ')
}

function getMobileNavLinkClass({ isActive }: { isActive: boolean }) {
  return [
    'flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2',
    isActive
      ? 'bg-emerald-50 font-medium text-emerald-800'
      : 'text-zinc-800',
  ].join(' ')
}

export function MainMenu({
  onNavigate,
  variant,
}: {
  onNavigate?: () => void
  variant: 'desktop' | 'mobile'
}) {
  const isDesktop = variant === 'desktop'

  return (
    <nav
      aria-label="Principal"
      className={isDesktop ? 'flex-1 p-4' : 'min-h-0 flex-1 overflow-y-auto p-4'}
    >
      <ul
        className={
          isDesktop
            ? 'space-y-1'
            : 'space-y-1'
        }
      >
        {navigationItems.map((item) => {
          const Icon = item.icon

          return (
            <li key={item.path}>
              <NavLink
                className={
                  isDesktop ? getDesktopNavLinkClass : getMobileNavLinkClass
                }
                onClick={onNavigate}
                to={item.path}
              >
                <Icon
                  className="h-5 w-5"
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
