import { Download, Plus, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { AppLayout } from '../components/layout/AppLayout'
import { AppointmentsPage } from '../features/appointments/AppointmentsPage'
import { LoginPage } from '../features/auth/LoginPage'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { PatientsPage } from '../features/patients/PatientsPage'
import { ProfessionalsPage } from '../features/professionals/ProfessionalsPage'
import { ReportsPage } from '../features/reports/ReportsPage'
import { ServicesPage } from '../features/services/ServicesPage'

const routes = [
  { path: '/dashboard', label: 'Dashboard', actionLabel: 'Novo atendimento' },
  { path: '/services', label: 'Serviços', actionLabel: 'Novo serviço' },
]

function PageAction({
  label,
  isReport,
  onClick,
}: {
  label: string
  isReport: boolean
  onClick?: () => void
}) {
  if (isReport) {
    return (
      <div className="flex gap-3">
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-stone-300 bg-white px-4 text-sm font-medium text-zinc-800 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Limpar filtros</span>
        </button>
        <button
          type="button"
          onClick={onClick}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

function RoutePlaceholder({ label }: { label: string }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-emerald-700">G.A Essência</p>
        <h3 className="mt-3 text-2xl font-semibold">{label}</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Layout aplicado. O conteudo desta tela sera implementado na task
          correspondente.
        </p>
      </div>
    </section>
  )
}

function RouteContent({ label, path }: { label: string; path: string }) {
  if (path === '/dashboard') {
    return <DashboardPage />
  }

  if (path === '/patients') {
    return <PatientsPage />
  }

  if (path === '/professionals') {
    return <ProfessionalsPage />
  }

  if (path === '/services') {
    return <ServicesPage />
  }

  if (path === '/reports') {
    return <ReportsPage />
  }

  return <RoutePlaceholder label={label} />
}

function PatientsRoute() {
  const [createRequest, setCreateRequest] = useState(0)

  return (
    <ProtectedRoute>
      <AppLayout
        title="Pacientes"
        action={
          <PageAction
            label="Novo paciente"
            isReport={false}
            onClick={() => setCreateRequest((current) => current + 1)}
          />
        }
      >
        <PatientsPage createRequest={createRequest} />
      </AppLayout>
    </ProtectedRoute>
  )
}

function ProfessionalsRoute() {
  const [createRequest, setCreateRequest] = useState(0)

  return (
    <ProtectedRoute>
      <AppLayout
        title="Profissionais"
        action={
          <PageAction
            label="Novo profissional"
            isReport={false}
            onClick={() => setCreateRequest((current) => current + 1)}
          />
        }
      >
        <ProfessionalsPage createRequest={createRequest} />
      </AppLayout>
    </ProtectedRoute>
  )
}

function AppointmentsRoute() {
  const [createRequest, setCreateRequest] = useState(0)

  return (
    <ProtectedRoute>
      <AppLayout
        title="Atendimentos"
        action={
          <PageAction
            label="Novo atendimento"
            isReport={false}
            onClick={() => setCreateRequest((current) => current + 1)}
          />
        }
      >
        <AppointmentsPage createRequest={createRequest} />
      </AppLayout>
    </ProtectedRoute>
  )
}

function ServicesRoute() {
  const [createRequest, setCreateRequest] = useState(0)

  return (
    <ProtectedRoute>
      <AppLayout
        title="Serviços"
        action={
          <PageAction
            label="Novo serviço"
            isReport={false}
            onClick={() => setCreateRequest((current) => current + 1)}
          />
        }
      >
        <ServicesPage createRequest={createRequest} />
      </AppLayout>
    </ProtectedRoute>
  )
}

function ReportsRoute() {
  const [exportRequest, setExportRequest] = useState(0)

  return (
    <ProtectedRoute>
      <AppLayout
        title="Relatorios"
        action={
          <PageAction
            label="Exportar CSV"
            isReport
            onClick={() => setExportRequest((current) => current + 1)}
          />
        }
      >
        <ReportsPage exportRequest={exportRequest} />
      </AppLayout>
    </ProtectedRoute>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/appointments" element={<AppointmentsRoute />} />
      <Route path="/patients" element={<PatientsRoute />} />
      <Route path="/professionals" element={<ProfessionalsRoute />} />
      <Route path="/services" element={<ServicesRoute />} />
      <Route path="/reports" element={<ReportsRoute />} />
      {routes.filter((route) => route.path !== '/services').map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute>
              <AppLayout
                title={route.label}
                action={
                  <PageAction
                    label={route.actionLabel}
                    isReport={route.path === '/reports'}
                  />
                }
              >
                <RouteContent label={route.label} path={route.path} />
              </AppLayout>
            </ProtectedRoute>
          }
        />
      ))}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
