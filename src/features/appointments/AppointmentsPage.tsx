import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Input } from '../../components/ui/Input'
import { LoadingState } from '../../components/ui/LoadingState'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table'
import type {
  AppointmentDTO,
  AppointmentStatus,
} from '../../domain/appointments/appointment.types'
import { appointmentRepository } from '../../repositories/appointment.repository'
import { patientRepository } from '../../repositories/patient.repository'
import { professionalRepository } from '../../repositories/professional.repository'
import { serviceRepository } from '../../repositories/service.repository'
import { formatCurrencyBRL } from '../../utils/formatCurrencyBRL'
import { AppointmentForm } from './AppointmentForm'
import type { AppointmentFormData } from './appointment.schema'

type AppointmentsPageProps = {
  createRequest?: number
}

type AppointmentFormMode =
  | { type: 'create' }
  | { appointment: AppointmentDTO; type: 'edit' }

type AppointmentStatusFilter = AppointmentStatus | 'all'

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

function AppointmentActions({
  appointment,
  isMutating,
  onEdit,
}: {
  appointment: AppointmentDTO
  isMutating: boolean
  onEdit: (appointment: AppointmentDTO) => void
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        aria-label={`Editar atendimento de ${formatOptional(
          appointment.patientName,
        )}`}
        icon={<Pencil className="h-4 w-4" aria-hidden="true" />}
        disabled={isMutating}
        onClick={() => onEdit(appointment)}
        size="icon"
        title="Editar"
        variant="ghost"
      />
      <Button
        aria-label={`Remover atendimento de ${formatOptional(
          appointment.patientName,
        )}`}
        disabled
        icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
        size="icon"
        title="Remover"
        variant="danger"
      />
    </div>
  )
}

function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return <Badge variant={status}>{statusLabels[status]}</Badge>
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

export function AppointmentsPage({ createRequest }: AppointmentsPageProps) {
  const queryClient = useQueryClient()
  const previousCreateRequestRef = useRef(createRequest)
  const [dateFilter, setDateFilter] = useState('')
  const [patientFilter, setPatientFilter] = useState('all')
  const [professionalFilter, setProfessionalFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [statusFilter, setStatusFilter] =
    useState<AppointmentStatusFilter>('all')
  const [formMode, setFormMode] = useState<AppointmentFormMode | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<string | undefined>()

  const appointmentFilters = {
    date: dateFilter || undefined,
    patientId: patientFilter === 'all' ? undefined : patientFilter,
    professionalId:
      professionalFilter === 'all' ? undefined : professionalFilter,
    serviceId: serviceFilter === 'all' ? undefined : serviceFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
  }

  const {
    data: appointments = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ['appointments', appointmentFilters],
    queryFn: () => appointmentRepository.list(appointmentFilters),
  })

  const {
    data: patientOptions = [],
    error: patientOptionsError,
    isLoading: isLoadingPatientOptions,
  } = useQuery({
    queryKey: ['patients', { active: true }],
    queryFn: () => patientRepository.list({ active: true }),
  })

  const {
    data: professionalOptions = [],
    error: professionalOptionsError,
    isLoading: isLoadingProfessionalOptions,
  } = useQuery({
    queryKey: ['professionals', { active: true }],
    queryFn: () => professionalRepository.list({ active: true }),
  })

  const {
    data: serviceOptions = [],
    error: serviceOptionsError,
    isLoading: isLoadingServiceOptions,
  } = useQuery({
    queryKey: ['services', { active: true }],
    queryFn: () => serviceRepository.list({ active: true }),
  })

  const createMutation = useMutation({
    mutationFn: (input: AppointmentFormData) =>
      appointmentRepository.create(input),
    onError: () => {
      setMutationError('Nao foi possivel salvar. Tente novamente.')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['appointments'] })
      setFeedbackMessage('Atendimento criado com sucesso.')
      setFormMode(null)
      setMutationError(undefined)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: AppointmentFormData }) =>
      appointmentRepository.update(id, input),
    onError: () => {
      setMutationError('Nao foi possivel salvar. Tente novamente.')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['appointments'] })
      setFeedbackMessage('Atendimento atualizado com sucesso.')
      setFormMode(null)
      setMutationError(undefined)
    },
  })

  useEffect(() => {
    if (
      createRequest !== undefined &&
      createRequest !== previousCreateRequestRef.current
    ) {
      setFormMode({ type: 'create' })
      setMutationError(undefined)
    }

    previousCreateRequestRef.current = createRequest
  }, [createRequest])

  function handleCloseForm() {
    setFormMode(null)
    setMutationError(undefined)
  }

  function handleEditAppointment(appointment: AppointmentDTO) {
    setFormMode({ appointment, type: 'edit' })
    setMutationError(undefined)
  }

  function handleClearFilters() {
    setDateFilter('')
    setPatientFilter('all')
    setProfessionalFilter('all')
    setServiceFilter('all')
    setStatusFilter('all')
  }

  async function handleSubmitAppointment(input: AppointmentFormData) {
    if (formMode?.type === 'edit') {
      await updateMutation.mutateAsync({ id: formMode.appointment.id, input })
      return
    }

    await createMutation.mutateAsync(input)
  }

  const isLoadingFormOptions =
    isLoadingPatientOptions ||
    isLoadingProfessionalOptions ||
    isLoadingServiceOptions
  const hasFormOptionsError =
    patientOptionsError || professionalOptionsError || serviceOptionsError
  const isFormSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-4">
      {feedbackMessage ? (
        <Card className="border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-800">
            {feedbackMessage}
          </p>
        </Card>
      ) : null}

      <section className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-[minmax(0,150px)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,170px)_auto]">
        <Input
          label="Data"
          onChange={(event) => setDateFilter(event.target.value)}
          type="date"
          value={dateFilter}
        />
        <Select
          label="Paciente"
          onChange={(event) => setPatientFilter(event.target.value)}
          options={toFilterOptions('Todos os pacientes', patientOptions)}
          value={patientFilter}
        />
        <Select
          label="Profissional"
          onChange={(event) => setProfessionalFilter(event.target.value)}
          options={toFilterOptions(
            'Todos os profissionais',
            professionalOptions,
          )}
          value={professionalFilter}
        />
        <Select
          label="Servico"
          onChange={(event) => setServiceFilter(event.target.value)}
          options={toFilterOptions('Todos os servicos', serviceOptions)}
          value={serviceFilter}
        />
        <Select
          label="Status"
          onChange={(event) =>
            setStatusFilter(event.target.value as AppointmentStatusFilter)
          }
          options={[
            { label: 'Todos os status', value: 'all' },
            ...Object.entries(statusLabels).map(([value, label]) => ({
              label,
              value,
            })),
          ]}
          value={statusFilter}
        />
        <div className="flex items-end">
          <Button
            className="w-full xl:w-auto"
            icon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
            onClick={handleClearFilters}
            type="button"
            variant="secondary"
          >
            Limpar
          </Button>
        </div>
      </section>

      {error ? (
        <ErrorState title="Nao foi possivel carregar os atendimentos." />
      ) : null}

      {isLoading ? (
        <LoadingState label="Carregando atendimentos..." variant="table" />
      ) : null}

      {!isLoading && !error && appointments.length === 0 ? (
        <EmptyState
          description="Crie um novo atendimento para iniciar a agenda."
          title="Nenhum atendimento encontrado."
        />
      ) : null}

      {!isLoading && !error && appointments.length > 0 ? (
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
                  <TableHead>Valor</TableHead>
                  <TableHead>Clinica</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{formatDate(appointment.appointmentDate)}</TableCell>
                    <TableCell>{formatTime(appointment.appointmentTime)}</TableCell>
                    <TableCell className="font-medium">
                      {formatOptional(appointment.patientName)}
                    </TableCell>
                    <TableCell>{formatOptional(appointment.serviceName)}</TableCell>
                    <TableCell>
                      {formatOptional(appointment.professionalName)}
                    </TableCell>
                    <TableCell>{formatCurrencyBRL(appointment.value)}</TableCell>
                    <TableCell>
                      {formatCurrencyBRL(appointment.clinicFeeValue)}
                    </TableCell>
                    <TableCell>
                      {formatCurrencyBRL(appointment.professionalGainValue)}
                    </TableCell>
                    <TableCell>
                      <AppointmentStatusBadge status={appointment.status} />
                    </TableCell>
                    <TableCell>
                      <AppointmentActions
                        appointment={appointment}
                        isMutating={isFormSubmitting}
                        onEdit={handleEditAppointment}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 xl:hidden">
            {appointments.map((appointment) => (
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
                  <AppointmentStatusBadge status={appointment.status} />
                </div>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="text-xs font-medium text-zinc-500">Quando</dt>
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
                      Valor total
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

                <div className="mt-3 flex justify-end">
                  <AppointmentActions
                    appointment={appointment}
                    isMutating={isFormSubmitting}
                    onEdit={handleEditAppointment}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : null}

      <Modal
        isOpen={Boolean(formMode)}
        onClose={handleCloseForm}
        title={
          formMode?.type === 'edit' ? 'Editar atendimento' : 'Novo atendimento'
        }
      >
        {hasFormOptionsError ? (
          <ErrorState
            description="Feche e tente abrir o formulario novamente."
            title="Nao foi possivel carregar os dados do formulario."
            variant="inline"
          />
        ) : null}

        {isLoadingFormOptions ? (
          <LoadingState
            label="Carregando dados do formulario..."
            rows={6}
            variant="form"
          />
        ) : null}

        {!isLoadingFormOptions && !hasFormOptionsError ? (
          <AppointmentForm
            defaultValues={
              formMode?.type === 'edit'
                ? {
                    appointmentDate: formMode.appointment.appointmentDate,
                    appointmentTime: formatTime(
                      formMode.appointment.appointmentTime,
                    ),
                    clinicFeePercentage:
                      formMode.appointment.clinicFeePercentage,
                    description: formMode.appointment.description,
                    notes: formMode.appointment.notes,
                    patientId: formMode.appointment.patientId,
                    professionalId: formMode.appointment.professionalId,
                    serviceId: formMode.appointment.serviceId,
                    status: formMode.appointment.status,
                    value: formMode.appointment.value,
                  }
                : undefined
            }
            errorMessage={mutationError}
            isSubmitting={isFormSubmitting}
            onCancel={handleCloseForm}
            onSubmit={handleSubmitAppointment}
            patientOptions={patientOptions}
            professionalOptions={professionalOptions}
            serviceOptions={serviceOptions}
            submitLabel={
              formMode?.type === 'edit'
                ? 'Salvar alteracoes'
                : 'Criar atendimento'
            }
          />
        ) : null}
      </Modal>
    </div>
  )
}
