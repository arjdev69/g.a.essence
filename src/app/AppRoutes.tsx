import { Download, Plus, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'
import { AppLayout } from '../components/layout/AppLayout'
import { AppointmentsPage } from '../features/appointments/AppointmentsPage'
import { LoginPage } from '../features/auth/LoginPage'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { PatientsPage } from '../features/patients/PatientsPage'
import { ProductsPage } from '../features/products/ProductsPage'
import { ProfessionalsPage } from '../features/professionals/ProfessionalsPage'
import { ReportsPage } from '../features/reports/ReportsPage'
import { ServicesPage } from '../features/services/ServicesPage'
import {
  createAppointmentNavigationState,
  shouldOpenAppointmentFormFromState,
} from './appointmentNavigation'

function PageAction({
  label,
  isReport,
  onClick,
  onSecondaryClick,
}: {
  label: string
  isReport: boolean
  onClick?: () => void
  onSecondaryClick?: () => void
}) {
  if (isReport) {
    return (
      <div className="flex gap-3">
        <button
          type="button"
          aria-label="Limpar filtros"
          onClick={onSecondaryClick}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-300 bg-white px-4 text-sm font-medium text-zinc-800 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Limpar filtros</span>
        </button>
        <button
          type="button"
          onClick={onClick}
          aria-label={label}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
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
      aria-label={label}
      className="inline-flex min-h-11 items-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
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

function DashboardRoute() {
  const navigate = useNavigate()

  return (
    <ProtectedRoute>
      <AppLayout
        title="Dashboard"
        action={
          <PageAction
            label="Novo atendimento"
            isReport={false}
            onClick={() =>
              navigate('/appointments', {
                state: createAppointmentNavigationState(),
              })
            }
          />
        }
      >
        <DashboardPage />
      </AppLayout>
    </ProtectedRoute>
  )
}

function AppointmentsRoute() {
  const location = useLocation()
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
        <AppointmentsPage
          createRequest={createRequest}
          openOnMount={shouldOpenAppointmentFormFromState(location.state)}
        />
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

function ProductsRoute() {
  const [createRequest, setCreateRequest] = useState(0)

  return (
    <ProtectedRoute>
      <AppLayout
        title="Produtos"
        action={
          <PageAction
            label="Novo produto"
            isReport={false}
            onClick={() => setCreateRequest((current) => current + 1)}
          />
        }
      >
        <ProductsPage createRequest={createRequest} />
      </AppLayout>
    </ProtectedRoute>
  )
}

function ReportsRoute() {
  const [clearFiltersRequest, setClearFiltersRequest] = useState(0)
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
            onSecondaryClick={() =>
              setClearFiltersRequest((current) => current + 1)
            }
          />
        }
      >
        <ReportsPage
          clearFiltersRequest={clearFiltersRequest}
          exportRequest={exportRequest}
        />
      </AppLayout>
    </ProtectedRoute>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardRoute />} />
      <Route path="/appointments" element={<AppointmentsRoute />} />
      <Route path="/patients" element={<PatientsRoute />} />
      <Route path="/professionals" element={<ProfessionalsRoute />} />
      <Route path="/services" element={<ServicesRoute />} />
      <Route path="/products" element={<ProductsRoute />} />
      <Route path="/reports" element={<ReportsRoute />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
