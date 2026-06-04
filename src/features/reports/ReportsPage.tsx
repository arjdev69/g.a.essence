import { useQuery } from '@tanstack/react-query'
import {
  CalendarCheck,
  CalendarDays,
  CircleDollarSign,
  Gift,
  UserRoundX,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { LoadingState } from '../../components/ui/LoadingState'
import { Select } from '../../components/ui/Select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table'
import type { AppointmentStatus } from '../../domain/appointments'
import {
  createMonthlyReportCsv,
  createMonthlySummary,
} from '../../domain/reports'
import { appointmentRepository } from '../../repositories/appointment.repository'
import { professionalRepository } from '../../repositories/professional.repository'
import { serviceRepository } from '../../repositories/service.repository'
import { formatCurrencyBRL } from '../../utils/formatCurrencyBRL'

type ReportsPageProps = {
  exportRequest?: number
}

function getCurrentReportDate(date = new Date()) {
  return {
    month: String(date.getMonth() + 1),
    year: String(date.getFullYear()),
  }
}

function getYearOptions(currentYear: number) {
  return Array.from({ length: 5 }, (_, index) => {
    const year = currentYear - index

    return {
      label: String(year),
      value: String(year),
    }
  })
}

function toFilterOptions(
  placeholder: string,
  options: Array<{ id: string; name: string }>,
) {
  return [
    { label: placeholder, value: 'all' },
    ...options.map((option) => ({
      label: option.name,
      value: option.id,
    })),
  ]
}

const monthOptions = [
  { label: 'Janeiro', value: '1' },
  { label: 'Fevereiro', value: '2' },
  { label: 'Marco', value: '3' },
  { label: 'Abril', value: '4' },
  { label: 'Maio', value: '5' },
  { label: 'Junho', value: '6' },
  { label: 'Julho', value: '7' },
  { label: 'Agosto', value: '8' },
  { label: 'Setembro', value: '9' },
  { label: 'Outubro', value: '10' },
  { label: 'Novembro', value: '11' },
  { label: 'Dezembro', value: '12' },
]

const statusLabels: Record<AppointmentStatus, string> = {
  cancelled: 'Cancelado',
  completed: 'Realizado',
  no_show: 'Faltou',
  paid: 'Pago',
  scheduled: 'Agendado',
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

function SummaryMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <Card className="p-5">
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

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function ReportsPage({ exportRequest }: ReportsPageProps) {
  const previousExportRequestRef = useRef(exportRequest)
  const currentDate = useMemo(() => getCurrentReportDate(), [])
  const [month, setMonth] = useState(currentDate.month)
  const [year, setYear] = useState(currentDate.year)
  const [professionalId, setProfessionalId] = useState('all')
  const [serviceId, setServiceId] = useState('all')
  const yearOptions = useMemo(
    () => getYearOptions(Number(currentDate.year)),
    [currentDate.year],
  )
  const reportInput = useMemo(
    () => ({
      month: Number(month),
      professionalId: professionalId === 'all' ? undefined : professionalId,
      serviceId: serviceId === 'all' ? undefined : serviceId,
      year: Number(year),
    }),
    [month, professionalId, serviceId, year],
  )

  const {
    data: professionals = [],
    error: professionalsError,
    isLoading: isLoadingProfessionals,
  } = useQuery({
    queryKey: ['professionals', { active: true }],
    queryFn: () => professionalRepository.list({ active: true }),
  })

  const {
    data: services = [],
    error: servicesError,
    isLoading: isLoadingServices,
  } = useQuery({
    queryKey: ['services', { active: true }],
    queryFn: () => serviceRepository.list({ active: true }),
  })

  const {
    data: appointments = [],
    error: appointmentsError,
    isLoading: isLoadingAppointments,
  } = useQuery({
    queryKey: [
      'appointments',
      'monthly-report',
      {
        professionalId: reportInput.professionalId,
        serviceId: reportInput.serviceId,
      },
    ],
    queryFn: () =>
      appointmentRepository.list({
        professionalId: reportInput.professionalId,
        serviceId: reportInput.serviceId,
      }),
  })

  const summary = useMemo(
    () => createMonthlySummary(reportInput, appointments),
    [appointments, reportInput],
  )

  const hasOptionsError = professionalsError || servicesError
  const hasReportError = hasOptionsError || appointmentsError
  const isLoadingOptions = isLoadingProfessionals || isLoadingServices
  const isLoadingReport = isLoadingOptions || isLoadingAppointments

  useEffect(() => {
    if (
      exportRequest === undefined ||
      exportRequest === previousExportRequestRef.current ||
      isLoadingReport ||
      hasReportError
    ) {
      previousExportRequestRef.current = exportRequest
      return
    }

    const csv = createMonthlyReportCsv(reportInput, summary)
    downloadCsv(csv.filename, csv.content)
    previousExportRequestRef.current = exportRequest
  }, [exportRequest, hasReportError, isLoadingReport, reportInput, summary])

  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-4">
        <Select
          label="Mes"
          onChange={(event) => setMonth(event.target.value)}
          options={monthOptions}
          value={month}
        />
        <Select
          label="Ano"
          onChange={(event) => setYear(event.target.value)}
          options={yearOptions}
          value={year}
        />
        <Select
          label="Profissional"
          onChange={(event) => setProfessionalId(event.target.value)}
          options={toFilterOptions('Todos os profissionais', professionals)}
          value={professionalId}
        />
        <Select
          label="Servico"
          onChange={(event) => setServiceId(event.target.value)}
          options={toFilterOptions('Todos os servicos', services)}
          value={serviceId}
        />
      </section>

      {hasReportError ? (
        <ErrorState title="Nao foi possivel carregar o relatorio." />
      ) : null}

      {isLoadingReport ? (
        <>
          <LoadingState label="Carregando relatorio..." variant="cards" />
          <LoadingState label="Carregando atendimentos..." variant="table" />
        </>
      ) : null}

      {!isLoadingReport && !hasReportError ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryMetric
            icon={<CircleDollarSign className="h-5 w-5" aria-hidden="true" />}
            label="Faturamento"
            value={formatCurrencyBRL(summary.totalRevenue)}
          />
          <SummaryMetric
            icon={<CalendarCheck className="h-5 w-5" aria-hidden="true" />}
            label="Atendimentos"
            value={String(summary.appointmentCount)}
          />
          <SummaryMetric
            icon={<UserRoundX className="h-5 w-5" aria-hidden="true" />}
            label="Cancelados / faltas"
            value={`${summary.cancelledCount} / ${summary.noShowCount}`}
          />
          <SummaryMetric
            icon={<Gift className="h-5 w-5" aria-hidden="true" />}
            label="Brindes"
            value={String(summary.giftCount)}
          />
        </section>
      ) : null}

      {!isLoadingReport && !hasReportError ? (
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <CalendarDays className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-950">
                Relatorio mensal
              </h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <dt className="text-xs font-medium text-zinc-500">Mes</dt>
                  <dd className="mt-1 text-zinc-900">
                    {monthOptions.find((option) => option.value === month)?.label}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-zinc-500">Ano</dt>
                  <dd className="mt-1 text-zinc-900">{year}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-zinc-500">
                    Profissional
                  </dt>
                  <dd className="mt-1 text-zinc-900">
                    {professionalId === 'all'
                      ? 'Todos'
                      : professionals.find(
                          (professional) => professional.id === professionalId,
                        )?.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-zinc-500">Servico</dt>
                  <dd className="mt-1 text-zinc-900">
                    {serviceId === 'all'
                      ? 'Todos'
                      : services.find((service) => service.id === serviceId)
                          ?.name}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </Card>
      ) : null}

      {!isLoadingReport && !hasReportError ? (
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-950">
                Breakdown por servico
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Totais considerando atendimentos financeiros do periodo.
              </p>
            </div>
            <Badge variant="default">{summary.byService.length}</Badge>
          </div>

          {summary.byService.length === 0 ? (
            <EmptyState
              title="Nenhum servico com faturamento no periodo."
              variant="inline"
            />
          ) : (
            <div className="mt-4 divide-y divide-stone-200">
              {summary.byService.map((service) => (
                <div
                  className="grid gap-3 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_120px_140px]"
                  key={service.serviceId}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-950">
                      {service.serviceName}
                    </p>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-zinc-500">
                      Atendimentos
                    </dt>
                    <dd className="mt-1 text-zinc-900">{service.count}</dd>
                  </div>
                  <div className="sm:text-right">
                    <dt className="text-xs font-medium text-zinc-500">
                      Total
                    </dt>
                    <dd className="mt-1 font-medium text-zinc-950">
                      {formatCurrencyBRL(service.total)}
                    </dd>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : null}

      {!isLoadingReport && !hasReportError ? (
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-950">
                Breakdown por profissional
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Totais considerando atendimentos financeiros do periodo.
              </p>
            </div>
            <Badge variant="default">{summary.byProfessional.length}</Badge>
          </div>

          {summary.byProfessional.length === 0 ? (
            <EmptyState
              title="Nenhum profissional com faturamento no periodo."
              variant="inline"
            />
          ) : (
            <div className="mt-4 divide-y divide-stone-200">
              {summary.byProfessional.map((professional) => (
                <div
                  className="grid gap-3 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_120px_140px]"
                  key={professional.professionalId}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-950">
                      {professional.professionalName}
                    </p>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-zinc-500">
                      Atendimentos
                    </dt>
                    <dd className="mt-1 text-zinc-900">
                      {professional.count}
                    </dd>
                  </div>
                  <div className="sm:text-right">
                    <dt className="text-xs font-medium text-zinc-500">
                      Total
                    </dt>
                    <dd className="mt-1 font-medium text-zinc-950">
                      {formatCurrencyBRL(professional.total)}
                    </dd>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : null}

      {!isLoadingReport && !hasReportError ? (
        summary.rows.length === 0 ? (
          <EmptyState
            description="Ajuste os filtros para consultar outro periodo."
            title="Nenhum atendimento encontrado."
          />
        ) : (
          <>
            <div className="hidden xl:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Servico</TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Clinica</TableHead>
                    <TableHead>Profissional</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.rows.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        {formatDate(appointment.appointmentDate)}
                      </TableCell>
                      <TableCell>
                        {formatTime(appointment.appointmentTime)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatOptional(appointment.patientName)}
                      </TableCell>
                      <TableCell>
                        {formatOptional(appointment.serviceName)}
                      </TableCell>
                      <TableCell>
                        {formatOptional(appointment.professionalName)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={appointment.status}>
                          {statusLabels[appointment.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrencyBRL(appointment.value)}</TableCell>
                      <TableCell>
                        {formatCurrencyBRL(appointment.clinicFeeValue)}
                      </TableCell>
                      <TableCell>
                        {formatCurrencyBRL(appointment.professionalGainValue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-3 xl:hidden">
              {summary.rows.map((appointment) => (
                <Card className="p-4" key={appointment.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-zinc-950">
                        {formatOptional(appointment.patientName)}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-600">
                        {formatOptional(appointment.serviceName)}
                      </p>
                    </div>
                    <Badge variant={appointment.status}>
                      {statusLabels[appointment.status]}
                    </Badge>
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium text-zinc-500">
                        Quando
                      </dt>
                      <dd className="mt-1 text-zinc-900">
                        {formatDate(appointment.appointmentDate)} as{' '}
                        {formatTime(appointment.appointmentTime)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-zinc-500">
                        Profissional
                      </dt>
                      <dd className="mt-1 text-zinc-900">
                        {formatOptional(appointment.professionalName)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-zinc-500">
                        Valor
                      </dt>
                      <dd className="mt-1 text-zinc-900">
                        {formatCurrencyBRL(appointment.value)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-zinc-500">
                        Divisao
                      </dt>
                      <dd className="mt-1 text-zinc-900">
                        {formatCurrencyBRL(appointment.clinicFeeValue)} /{' '}
                        {formatCurrencyBRL(appointment.professionalGainValue)}
                      </dd>
                    </div>
                  </dl>
                </Card>
              ))}
            </div>
          </>
        )
      ) : null}
    </div>
  )
}
