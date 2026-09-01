import { useQuery } from '@tanstack/react-query'
import {
  Building2,
  CalendarCheck,
  CircleDollarSign,
  UserRoundCheck,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { LoadingState } from '../../components/ui/LoadingState'
import type { AppointmentDTO, AppointmentStatus } from '../../domain/appointments'
import { createMonthlySummary } from '../../domain/reports'
import { appointmentRepository } from '../../repositories/appointment.repository'
import { formatCurrencyBRL } from '../../utils/formatCurrencyBRL'

const monthFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
})

const statusLabels: Record<AppointmentStatus, string> = {
  cancelled: 'Cancelado',
  completed: 'Realizado',
  no_show: 'Faltou',
  paid: 'Pago',
  scheduled: 'Agendado',
}

function getCurrentMonthInput(date = new Date()) {
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  }
}

function getTodayDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDate(date: string) {
  const [year, month, day] = date.split('-')

  if (!year || !month || !day) {
    return date
  }

  return `${day}/${month}/${year}`
}

function formatTime(time: string) {
  return time.slice(0, 5)
}

function formatOptional(value: string | null | undefined) {
  return value?.trim() ? value : '-'
}

function getUpcomingAppointments(appointments: AppointmentDTO[]) {
  const today = getTodayDateKey()

  return appointments
    .filter(
      (appointment) =>
        appointment.appointmentDate > today &&
        appointment.status === 'scheduled',
    )
    .sort((first, second) => {
      const firstDateTime = `${first.appointmentDate} ${first.appointmentTime}`
      const secondDateTime = `${second.appointmentDate} ${second.appointmentTime}`

      return firstDateTime.localeCompare(secondDateTime)
    })
    .slice(0, 5)
}

function getTodayAppointments(appointments: AppointmentDTO[]) {
  const today = getTodayDateKey()

  return appointments
    .filter((appointment) => appointment.appointmentDate === today)
    .sort((first, second) =>
      first.appointmentTime.localeCompare(second.appointmentTime),
    )
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-zinc-950">{value}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          {icon}
        </div>
      </div>
    </Card>
  )
}

function UpcomingAppointments({
  appointments,
}: {
  appointments: AppointmentDTO[]
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-950">
            Proximos atendimentos
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Agenda futura com status agendado.
          </p>
        </div>
        <Badge variant="scheduled">{appointments.length}</Badge>
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          title="Nenhum proximo atendimento encontrado."
          variant="inline"
        />
      ) : (
        <div className="mt-4 divide-y divide-stone-200">
          {appointments.map((appointment) => (
            <div
              className="grid gap-3 py-3 text-sm md:grid-cols-[140px_minmax(0,1fr)_minmax(0,1fr)_120px]"
              key={appointment.id}
            >
              <div>
                <p className="font-medium text-zinc-950">
                  {formatDate(appointment.appointmentDate)}
                </p>
                <p className="mt-1 text-zinc-500">
                  {formatTime(appointment.appointmentTime)}
                </p>
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-zinc-950">
                  {formatOptional(appointment.patientName)}
                </p>
                <p className="mt-1 truncate text-zinc-500">
                  {formatOptional(appointment.serviceName)}
                </p>
              </div>
              <div className="min-w-0">
                <p className="truncate text-zinc-700">
                  {formatOptional(appointment.professionalName)}
                </p>
              </div>
              <div className="md:text-right">
                <p className="font-medium text-zinc-950">
                  {formatCurrencyBRL(appointment.value)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function TodayAppointments({ appointments }: { appointments: AppointmentDTO[] }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-950">
            Atendimentos de hoje
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Agenda do dia atual.
          </p>
        </div>
        <Badge variant="default">{appointments.length}</Badge>
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          title="Nenhum atendimento encontrado para hoje."
          variant="inline"
        />
      ) : (
        <div className="mt-4 divide-y divide-stone-200">
          {appointments.map((appointment) => (
            <div
              className="grid gap-3 py-3 text-sm md:grid-cols-[90px_minmax(0,1fr)_minmax(0,1fr)_120px_120px]"
              key={appointment.id}
            >
              <div>
                <p className="font-medium text-zinc-950">
                  {formatTime(appointment.appointmentTime)}
                </p>
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-zinc-950">
                  {formatOptional(appointment.patientName)}
                </p>
                <p className="mt-1 truncate text-zinc-500">
                  {formatOptional(appointment.serviceName)}
                </p>
              </div>
              <div className="min-w-0">
                <p className="truncate text-zinc-700">
                  {formatOptional(appointment.professionalName)}
                </p>
              </div>
              <div>
                <Badge variant={appointment.status}>
                  {statusLabels[appointment.status]}
                </Badge>
              </div>
              <div className="md:text-right">
                <p className="font-medium text-zinc-950">
                  {formatCurrencyBRL(appointment.value)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export function DashboardPage() {
  const currentMonth = useMemo(() => getCurrentMonthInput(), [])
  const {
    data: appointments = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ['appointments', 'dashboard-summary'],
    queryFn: () => appointmentRepository.list(),
  })

  const summary = useMemo(
    () => createMonthlySummary(currentMonth, appointments),
    [appointments, currentMonth],
  )
  const upcomingAppointments = useMemo(
    () => getUpcomingAppointments(appointments),
    [appointments],
  )
  const todayAppointments = useMemo(
    () => getTodayAppointments(appointments),
    [appointments],
  )
  const monthLabel = monthFormatter.format(
    new Date(currentMonth.year, currentMonth.month - 1, 1),
  )

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-zinc-500">Resumo de {monthLabel}</p>
      </div>

      {error ? (
        <ErrorState title="Nao foi possivel carregar o dashboard." />
      ) : null}

      {isLoading ? (
        <>
          <LoadingState label="Carregando dashboard..." variant="cards" />
          <LoadingState label="Carregando agenda..." rows={2} variant="list" />
        </>
      ) : null}

      {!isLoading && !error ? (
        <section className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-4">
          <SummaryCard
            icon={<CircleDollarSign className="h-5 w-5" aria-hidden="true" />}
            label="Faturamento do mes"
            value={formatCurrencyBRL(summary.totalRevenue)}
          />
          <SummaryCard
            icon={<Building2 className="h-5 w-5" aria-hidden="true" />}
            label="Receita da clinica"
            value={formatCurrencyBRL(summary.totalClinicRevenue)}
          />
          <SummaryCard
            icon={<UserRoundCheck className="h-5 w-5" aria-hidden="true" />}
            label="Ganho profissional"
            value={formatCurrencyBRL(summary.totalProfessionalRevenue)}
          />
          <SummaryCard
            icon={<CalendarCheck className="h-5 w-5" aria-hidden="true" />}
            label="Atendimentos realizados"
            value={String(summary.appointmentCount)}
          />
        </section>
      ) : null}

      {!isLoading && !error ? (
        <TodayAppointments appointments={todayAppointments} />
      ) : null}

      {!isLoading && !error ? (
        <UpcomingAppointments appointments={upcomingAppointments} />
      ) : null}
    </div>
  )
}
