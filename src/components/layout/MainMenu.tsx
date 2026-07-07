import {
  BarChart3,
  Briefcase,
  CalendarDays,
  LayoutDashboard,
  Package,
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
  { path: '/products', label: 'Produtos', icon: Package },
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
    'inline-flex min-w-[4.75rem] flex-col items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[11px] leading-4 transition-colors',
    isActive
      ? 'bg-emerald-50 font-medium text-emerald-800'
      : 'text-zinc-800',
  ].join(' ')
}

export function MainMenu({ variant }: { variant: 'desktop' | 'mobile' }) {
  const isDesktop = variant === 'desktop'

  return (
    <nav aria-label="Principal" className={isDesktop ? 'flex-1 p-4' : ''}>
      <ul
        className={
          isDesktop
            ? 'space-y-1'
            : 'flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        }
      >
        {navigationItems.map((item) => {
          const Icon = item.icon

          return (
            <li key={item.path} className={isDesktop ? undefined : 'shrink-0'}>
              <NavLink
                className={
                  isDesktop ? getDesktopNavLinkClass : getMobileNavLinkClass
                }
                to={item.path}
              >
                <Icon
                  className={isDesktop ? 'h-5 w-5' : 'h-4 w-4'}
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
