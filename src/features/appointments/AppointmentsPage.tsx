import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react'
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
import {
  createAppointmentCalendarIcs,
  prepareAppointmentCalendarInput,
} from '../../domain/calendar'
import { appointmentRepository } from '../../repositories/appointment.repository'
import { patientRepository } from '../../repositories/patient.repository'
import { professionalRepository } from '../../repositories/professional.repository'
import { serviceRepository } from '../../repositories/service.repository'
import {
  getAppointmentMonthRange,
  isValidAppointmentDateRange,
  type AppointmentDateRange,
} from '../../utils/appointmentPeriod'
import { formatCurrencyBRL } from '../../utils/formatCurrencyBRL'
import { downloadFile } from '../../services/export'
import { AppointmentForm } from './AppointmentForm'
import type { AppointmentFormData } from './appointment.schema'

type AppointmentsPageProps = {
  createRequest?: number
  openOnMount?: boolean
}

type AppointmentFormMode =
  | { type: 'create' }
  | { appointment: AppointmentDTO; type: 'edit' }

type AppointmentStatusFilter = AppointmentStatus | 'all'
type AppointmentPeriodMode = 'month' | 'custom'
type MonthSelection = { month: number; year: number }

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

function getCurrentMonthSelection(now = new Date()): MonthSelection {
  return { month: now.getMonth() + 1, year: now.getFullYear() }
}

function formatMonthInputValue(selection: MonthSelection) {
  return `${String(selection.year).padStart(4, '0')}-${String(selection.month).padStart(2, '0')}`
}

function formatMonthLabel(selection: MonthSelection) {
  const label = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(new Date(Date.UTC(selection.year, selection.month - 1, 1)))

  return label.charAt(0).toUpperCase() + label.slice(1)
}

function getDateRangeError(dateFrom: string, dateTo: string) {
  if (!dateFrom || !dateTo) {
    return 'Informe as datas inicial e final.'
  }

  return isValidAppointmentDateRange({ dateFrom, dateTo })
    ? null
    : 'A data inicial deve ser anterior ou igual à data final.'
}

function formatDateRangeLabel(range: AppointmentDateRange) {
  return `${formatDate(range.dateFrom)} a ${formatDate(range.dateTo)}`
}

function getAppointmentSubject(appointment: AppointmentDTO) {
  return appointment.patientName?.trim() || 'atendimento'
}

function ActiveFilterChip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <button
      type="button"
      aria-label={`Remover filtro ${label}`}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
      onClick={onRemove}
    >
      <span>{label}</span>
      <X className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  )
}

function CalendarCalendarButton({
  appointment,
  className,
  isDisabled,
  isExporting,
  onClick,
  role,
}: {
  appointment: AppointmentDTO
  className?: string
  isDisabled: boolean
  isExporting: boolean
  onClick: (appointment: AppointmentDTO) => void
  role?: 'menuitem'
}) {
  const calendarValidation = prepareAppointmentCalendarInput(appointment)
  const isCalendarDisabled = isDisabled || !calendarValidation.ok

  return (
    <Button
      aria-label={`Adicionar atendimento de ${getAppointmentSubject(appointment)} ao calendario`}
      className={`min-h-11 ${className ?? ''}`}
      disabled={isCalendarDisabled}
      icon={<CalendarDays className="h-4 w-4" aria-hidden="true" />}
      onClick={() => onClick(appointment)}
      role={role}
      size="sm"
      title={
        calendarValidation.ok
          ? 'Adicionar ao calendario'
          : 'Dados do atendimento incompletos'
      }
      variant="secondary"
    >
      {isExporting ? 'Gerando calendario...' : 'Adicionar ao calendario'}
    </Button>
  )
}

function AppointmentActions({
  appointment,
  isCalendarExporting,
  isMutating,
  onEdit,
  onCalendarClick,
  onRemove,
}: {
  appointment: AppointmentDTO
  isCalendarExporting: boolean
  isMutating: boolean
  onCalendarClick: (appointment: AppointmentDTO) => void
  onRemove: (appointment: AppointmentDTO) => void
  onEdit: (appointment: AppointmentDTO) => void
}) {
  const subject = getAppointmentSubject(appointment)
  const isDisabled = isMutating || isCalendarExporting

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        aria-label={`Editar atendimento de ${subject}`}
        className="shrink-0"
        disabled={isDisabled}
        icon={<Pencil className="h-4 w-4" aria-hidden="true" />}
        onClick={() => onEdit(appointment)}
        size="sm"
        title="Editar atendimento"
        variant="ghost"
      />
      <CalendarCalendarButton
        appointment={appointment}
        className="shrink-0"
        isDisabled={isDisabled}
        isExporting={isCalendarExporting}
        onClick={onCalendarClick}
      />
      <Button
        aria-label={`Remover atendimento de ${subject}`}
        className="shrink-0"
        disabled={isDisabled}
        icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
        size="sm"
        title="Remover atendimento"
        variant="danger"
        onClick={() => onRemove(appointment)}
      >
        Remover
      </Button>
    </div>
  )
}

function AppointmentCardActions({
  appointment,
  isCalendarExporting,
  isMutating,
  onCalendarClick,
  onEdit,
  onRemove,
}: {
  appointment: AppointmentDTO
  isCalendarExporting: boolean
  isMutating: boolean
  onCalendarClick: (appointment: AppointmentDTO) => void
  onRemove: (appointment: AppointmentDTO) => void
  onEdit: (appointment: AppointmentDTO) => void
}) {
  const subject = getAppointmentSubject(appointment)
  const isDisabled = isMutating || isCalendarExporting
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-100 pt-3">
      <Button
        aria-label={`Editar atendimento de ${subject}`}
        className="min-h-11 flex-1 justify-start px-3 sm:flex-none"
        disabled={isDisabled}
        icon={<Pencil className="h-4 w-4" aria-hidden="true" />}
        onClick={() => onEdit(appointment)}
        title="Editar atendimento"
        variant="ghost"
      >
        Editar
      </Button>

      <div className="relative">
        <Button
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          aria-label={`Mais ações para ${subject}`}
          className="min-h-11 min-w-11"
          disabled={isDisabled}
          icon={<MoreHorizontal className="h-5 w-5" aria-hidden="true" />}
          onClick={() => setIsMenuOpen((current) => !current)}
          size="icon"
          title="Mais ações"
          variant="ghost"
        />

        {isMenuOpen ? (
          <div
            className="absolute right-0 top-full z-20 mt-2 w-56 rounded-lg border border-stone-200 bg-white p-1 shadow-lg"
            role="menu"
          >
            <CalendarCalendarButton
              appointment={appointment}
              className="min-h-11 w-full justify-start rounded-md"
              isDisabled={isDisabled}
              isExporting={isCalendarExporting}
              onClick={(selectedAppointment) => {
                setIsMenuOpen(false)
                onCalendarClick(selectedAppointment)
              }}
              role="menuitem"
            />
            <Button
              className="min-h-11 w-full justify-start rounded-md"
              icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
              onClick={() => {
                setIsMenuOpen(false)
                onRemove(appointment)
              }}
              role="menuitem"
              variant="danger"
            >
              Remover
            </Button>
          </div>
        ) : null}
      </div>
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

export function AppointmentsPage({
  createRequest,
  openOnMount = false,
}: AppointmentsPageProps) {
  const queryClient = useQueryClient()
  const previousCreateRequestRef = useRef(createRequest)
  const shouldOpenOnMountRef = useRef(openOnMount)
  const initialMonthSelection = getCurrentMonthSelection()
  const initialMonthRange = getAppointmentMonthRange(
    initialMonthSelection.year,
    initialMonthSelection.month,
  )
  const [monthSelection, setMonthSelection] =
    useState<MonthSelection>(initialMonthSelection)
  const [periodMode, setPeriodMode] =
    useState<AppointmentPeriodMode>('month')
  const [customDateFrom, setCustomDateFrom] = useState(
    initialMonthRange.dateFrom,
  )
  const [customDateTo, setCustomDateTo] = useState(initialMonthRange.dateTo)
  const [searchFilter, setSearchFilter] = useState('')
  const [patientFilter, setPatientFilter] = useState('all')
  const [professionalFilter, setProfessionalFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [statusFilter, setStatusFilter] =
    useState<AppointmentStatusFilter>('all')
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false)
  const [previousValidDateRange, setPreviousValidDateRange] =
    useState<AppointmentDateRange>(initialMonthRange)
  const [formMode, setFormMode] = useState<AppointmentFormMode | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [calendarFeedbackMessage, setCalendarFeedbackMessage] = useState<
    string | null
  >(null)
  const [calendarErrorMessage, setCalendarErrorMessage] = useState<
    string | null
  >(null)
  const [isCalendarExporting, setIsCalendarExporting] = useState(false)
  const [mutationError, setMutationError] = useState<string | undefined>()
  const [appointmentToRemove, setAppointmentToRemove] =
    useState<AppointmentDTO | null>(null)
  const [removeErrorMessage, setRemoveErrorMessage] = useState<string | null>(
    null,
  )

  const selectedMonthRange = getAppointmentMonthRange(
    monthSelection.year,
    monthSelection.month,
  )
  const customDateRange = {
    dateFrom: customDateFrom,
    dateTo: customDateTo,
  }
  const periodError =
    periodMode === 'custom'
      ? getDateRangeError(customDateFrom, customDateTo)
      : null
  const selectedDateRange =
    periodMode === 'custom'
      ? periodError
        ? previousValidDateRange
        : customDateRange
      : selectedMonthRange

  const appointmentFilters = {
    dateFrom: selectedDateRange.dateFrom,
    dateTo: selectedDateRange.dateTo,
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
    refetch,
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

  const normalizedSearchFilter = searchFilter.trim().toLocaleLowerCase()
  const visibleAppointments = normalizedSearchFilter
    ? appointments.filter((appointment) =>
        [appointment.patientName, appointment.serviceName]
          .filter(Boolean)
          .some((value) =>
            value?.toLocaleLowerCase().includes(normalizedSearchFilter),
          ),
      )
    : appointments

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

  const removeMutation = useMutation({
    mutationFn: (id: string) => appointmentRepository.remove(id),
    onError: () => {
      setFeedbackMessage(null)
      setCalendarFeedbackMessage(null)
      setRemoveErrorMessage('Nao foi possivel remover. Tente novamente.')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['appointments'] })
      setFeedbackMessage('Atendimento removido com sucesso.')
      setCalendarErrorMessage(null)
      setRemoveErrorMessage(null)
      setAppointmentToRemove(null)
    },
  })

  useEffect(() => {
    if (shouldOpenOnMountRef.current) {
      setFormMode({ type: 'create' })
      setMutationError(undefined)
      shouldOpenOnMountRef.current = false
      previousCreateRequestRef.current = createRequest
      return
    }

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

  function handleMonthSelectionChange(value: string) {
    const [yearText, monthText] = value.split('-')
    const year = Number(yearText)
    const month = Number(monthText)

    if (!Number.isInteger(year) || !Number.isInteger(month)) {
      return
    }

    const nextMonthSelection = { month, year }
    const nextDateRange = getAppointmentMonthRange(year, month)

    setMonthSelection(nextMonthSelection)
    setPeriodMode('month')
    setCustomDateFrom(nextDateRange.dateFrom)
    setCustomDateTo(nextDateRange.dateTo)
    setPreviousValidDateRange(nextDateRange)
  }

  function handleMoveMonth(offset: number) {
    const nextMonth = new Date(
      Date.UTC(monthSelection.year, monthSelection.month - 1 + offset, 1),
    )

    handleMonthSelectionChange(
      formatMonthInputValue({
        month: nextMonth.getUTCMonth() + 1,
        year: nextMonth.getUTCFullYear(),
      }),
    )
  }

  function handleToggleCustomPeriod() {
    if (periodMode === 'custom') {
      setPeriodMode('month')
      return
    }

    const range = previousValidDateRange
    setCustomDateFrom(range.dateFrom)
    setCustomDateTo(range.dateTo)
    setPeriodMode('custom')
  }

  function handleCustomDateChange(
    field: 'dateFrom' | 'dateTo',
    value: string,
  ) {
    const nextDateRange = {
      dateFrom: field === 'dateFrom' ? value : customDateFrom,
      dateTo: field === 'dateTo' ? value : customDateTo,
    }

    if (field === 'dateFrom') {
      setCustomDateFrom(value)
    } else {
      setCustomDateTo(value)
    }

    if (isValidAppointmentDateRange(nextDateRange)) {
      setPreviousValidDateRange(nextDateRange)
    }
  }

  function handleResetPeriod() {
    const currentMonth = getCurrentMonthSelection()
    const currentMonthRange = getAppointmentMonthRange(
      currentMonth.year,
      currentMonth.month,
    )

    setMonthSelection(currentMonth)
    setCustomDateFrom(currentMonthRange.dateFrom)
    setCustomDateTo(currentMonthRange.dateTo)
    setPeriodMode('month')
    setPreviousValidDateRange(currentMonthRange)
  }

  function handleClearFilters() {
    handleResetPeriod()
    setSearchFilter('')
    setPatientFilter('all')
    setProfessionalFilter('all')
    setServiceFilter('all')
    setStatusFilter('all')
    setIsMoreFiltersOpen(false)
  }

  async function handleSubmitAppointment(input: AppointmentFormData) {
    if (formMode?.type === 'edit') {
      if (updateMutation.isPending) {
        return
      }

      await updateMutation.mutateAsync({ id: formMode.appointment.id, input })
      return
    }

    if (createMutation.isPending) {
      return
    }

    await createMutation.mutateAsync(input)
  }

  function handleRemoveAppointment(appointment: AppointmentDTO) {
    setRemoveErrorMessage(null)
    setAppointmentToRemove(appointment)
  }

  async function handleConfirmRemove() {
    if (!appointmentToRemove) {
      return
    }

    await removeMutation.mutateAsync(appointmentToRemove.id)
  }

  function handleCloseRemoveConfirmation() {
    if (removeMutation.isPending) {
      return
    }

    setRemoveErrorMessage(null)
    setAppointmentToRemove(null)
  }

  async function handleCalendarClick(appointment: AppointmentDTO) {
    setCalendarFeedbackMessage(null)
    setCalendarErrorMessage(null)
    setIsCalendarExporting(true)

    try {
      await Promise.resolve()
      const calendarFile = createAppointmentCalendarIcs(appointment)
      downloadFile({
        content: calendarFile.content,
        filename: calendarFile.filename,
        mimeType: 'text/calendar;charset=utf-8',
      })
      setCalendarFeedbackMessage(
        `Arquivo ${calendarFile.filename} baixado. Abra-o para adicionar ao calendario.`,
      )
    } catch {
      setCalendarErrorMessage(
        'Nao foi possivel gerar o calendario. Tente novamente.',
      )
    } finally {
      setIsCalendarExporting(false)
    }
  }

  const isLoadingFormOptions =
    isLoadingPatientOptions ||
    isLoadingProfessionalOptions ||
    isLoadingServiceOptions
  const hasFormOptionsError =
    patientOptionsError || professionalOptionsError || serviceOptionsError
  const isFormSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    removeMutation.isPending
  const hasCalendarFeedback =
    calendarFeedbackMessage !== null || calendarErrorMessage !== null
  const currentMonthSelection = getCurrentMonthSelection()
  const isCurrentMonth =
    monthSelection.month === currentMonthSelection.month &&
    monthSelection.year === currentMonthSelection.year
  const activeFilterChips = [
    {
      key: 'period',
      label:
        periodMode === 'custom'
          ? periodError
            ? 'Período inválido'
            : formatDateRangeLabel(customDateRange)
          : formatMonthLabel(monthSelection),
      onRemove: handleResetPeriod,
    },
    ...(searchFilter.trim()
      ? [
          {
            key: 'search',
            label: `Busca: ${searchFilter.trim()}`,
            onRemove: () => setSearchFilter(''),
          },
        ]
      : []),
    ...(statusFilter !== 'all'
      ? [
          {
            key: 'status',
            label: statusLabels[statusFilter],
            onRemove: () => setStatusFilter('all'),
          },
        ]
      : []),
    ...(patientFilter !== 'all'
      ? [
          {
            key: 'patient',
            label: `Paciente: ${patientOptions.find((option) => option.id === patientFilter)?.name ?? 'selecionado'}`,
            onRemove: () => setPatientFilter('all'),
          },
        ]
      : []),
    ...(professionalFilter !== 'all'
      ? [
          {
            key: 'professional',
            label: `Profissional: ${professionalOptions.find((option) => option.id === professionalFilter)?.name ?? 'selecionado'}`,
            onRemove: () => setProfessionalFilter('all'),
          },
        ]
      : []),
    ...(serviceFilter !== 'all'
      ? [
          {
            key: 'service',
            label: `Serviço: ${serviceOptions.find((option) => option.id === serviceFilter)?.name ?? 'selecionado'}`,
            onRemove: () => setServiceFilter('all'),
          },
        ]
      : []),
  ]
  const hasAdditionalFilters =
    !isCurrentMonth ||
    periodMode === 'custom' ||
    Boolean(searchFilter.trim()) ||
    patientFilter !== 'all' ||
    professionalFilter !== 'all' ||
    serviceFilter !== 'all' ||
    statusFilter !== 'all'

  return (
    <div className="space-y-4">
      {hasCalendarFeedback ? (
        <Card
          className={
            calendarErrorMessage
              ? 'border-red-200 bg-red-50 p-4'
              : 'border-emerald-200 bg-emerald-50 p-4'
          }
          role="status"
          aria-live="polite"
        >
          <p
            className={
              calendarErrorMessage
                ? 'text-sm font-medium text-red-800'
                : 'text-sm font-medium text-emerald-800'
            }
          >
            {calendarErrorMessage ?? calendarFeedbackMessage}
          </p>
        </Card>
      ) : null}

      {feedbackMessage ? (
        <Card className="border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-800">
            {feedbackMessage}
          </p>
        </Card>
      ) : null}

      <section
        className="space-y-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
        aria-label="Filtros da agenda"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Período
            </p>
            <div className="mt-2 flex items-end gap-2">
              <Button
                aria-label="Mês anterior"
                className="min-h-11 min-w-11"
                icon={<ChevronLeft className="h-4 w-4" aria-hidden="true" />}
                onClick={() => handleMoveMonth(-1)}
                size="icon"
                variant="secondary"
              />
              <Input
                aria-label="Mês selecionado"
                className="min-h-11 min-w-0 text-base sm:text-sm"
                id="appointment-month"
                label="Mês"
                onChange={(event) =>
                  handleMonthSelectionChange(event.target.value)
                }
                type="month"
                value={formatMonthInputValue(monthSelection)}
              />
              <Button
                aria-label="Próximo mês"
                className="min-h-11 min-w-11"
                icon={<ChevronRight className="h-4 w-4" aria-hidden="true" />}
                onClick={() => handleMoveMonth(1)}
                size="icon"
                variant="secondary"
              />
            </div>
          </div>
          <Button
            aria-expanded={periodMode === 'custom'}
            aria-controls="appointment-custom-period"
            className="min-h-11 w-full sm:w-auto"
            onClick={handleToggleCustomPeriod}
            type="button"
            variant="secondary"
          >
            {periodMode === 'custom'
              ? 'Usar mês selecionado'
              : 'Escolher período personalizado'}
          </Button>
        </div>

        {periodMode === 'custom' ? (
          <div
            className="grid gap-3 border-t border-stone-100 pt-4 sm:grid-cols-2"
            id="appointment-custom-period"
          >
            <Input
              className="min-h-11 text-base sm:text-sm"
              error={periodError ?? undefined}
              id="appointment-date-from"
              label="De"
              onChange={(event) =>
                handleCustomDateChange('dateFrom', event.target.value)
              }
              type="date"
              value={customDateFrom}
            />
            <Input
              className="min-h-11 text-base sm:text-sm"
              error={periodError ?? undefined}
              id="appointment-date-to"
              label="Até"
              onChange={(event) =>
                handleCustomDateChange('dateTo', event.target.value)
              }
              type="date"
              value={customDateTo}
            />
          </div>
        ) : null}

        {periodError ? (
          <p className="text-sm text-red-700" role="alert">
            {periodError}
          </p>
        ) : null}

        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,220px)]">
          <Input
            aria-label="Buscar paciente ou serviço"
            className="min-h-11 text-base sm:text-sm"
            id="appointment-search"
            label="Buscar paciente ou serviço"
            onChange={(event) => setSearchFilter(event.target.value)}
            placeholder="Nome do paciente ou serviço"
            type="search"
            value={searchFilter}
          />
          <Select
            className="min-h-11"
            id="appointment-status"
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
        </div>

        <div className="flex flex-col gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            aria-controls="appointment-more-filters"
            aria-expanded={isMoreFiltersOpen}
            className="min-h-11 w-full sm:w-auto"
            onClick={() => setIsMoreFiltersOpen((current) => !current)}
            type="button"
            variant="secondary"
          >
            {isMoreFiltersOpen ? 'Ocultar filtros' : 'Mais filtros'}
          </Button>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <p
              className="text-sm font-medium text-zinc-600"
              aria-live="polite"
            >
              {visibleAppointments.length}{' '}
              {visibleAppointments.length === 1
                ? 'atendimento encontrado'
                : 'atendimentos encontrados'}
            </p>
            <Button
              aria-label="Limpar filtros da agenda"
              className="min-h-11 shrink-0"
              icon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
              onClick={handleClearFilters}
              type="button"
              variant="ghost"
            >
              Limpar
            </Button>
          </div>
        </div>

        {isMoreFiltersOpen ? (
          <div
            className="grid gap-3 border-t border-stone-100 pt-4 md:grid-cols-3"
            id="appointment-more-filters"
          >
            <Select
              className="min-h-11"
              id="appointment-patient"
              label="Paciente"
              onChange={(event) => setPatientFilter(event.target.value)}
              options={toFilterOptions('Todos os pacientes', patientOptions)}
              value={patientFilter}
            />
            <Select
              className="min-h-11"
              id="appointment-professional"
              label="Profissional"
              onChange={(event) => setProfessionalFilter(event.target.value)}
              options={toFilterOptions(
                'Todos os profissionais',
                professionalOptions,
              )}
              value={professionalFilter}
            />
            <Select
              className="min-h-11"
              id="appointment-service"
              label="Serviço"
              onChange={(event) => setServiceFilter(event.target.value)}
              options={toFilterOptions('Todos os serviços', serviceOptions)}
              value={serviceFilter}
            />
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2" aria-label="Filtros ativos">
          {activeFilterChips.map((chip) => (
            <ActiveFilterChip
              key={chip.key}
              label={chip.label}
              onRemove={chip.onRemove}
            />
          ))}
        </div>

        {hasAdditionalFilters ? (
          <p className="text-xs text-zinc-500">
            Os resultados são atualizados automaticamente ao alterar um filtro.
          </p>
        ) : null}
      </section>

      {error ? (
        <ErrorState
          action={
            <Button className="min-h-11" onClick={() => void refetch()} variant="secondary">
              Tentar novamente
            </Button>
          }
          title="Nao foi possivel carregar os atendimentos."
        />
      ) : null}

      {isLoading ? (
        <LoadingState label="Carregando atendimentos..." variant="table" />
      ) : null}

      {!isLoading && !error && visibleAppointments.length === 0 ? (
        <EmptyState
          action={
            hasAdditionalFilters ? (
              <Button
                className="min-h-11"
                onClick={handleClearFilters}
                variant="secondary"
              >
                Limpar filtros
              </Button>
            ) : undefined
          }
          description={
            hasAdditionalFilters
              ? 'Ajuste ou limpe os filtros para ver outros atendimentos.'
              : 'Crie um novo atendimento para iniciar a agenda.'
          }
          title={
            hasAdditionalFilters
              ? 'Nenhum atendimento encontrado.'
              : 'Nenhum atendimento cadastrado neste período.'
          }
        />
      ) : null}

      {!isLoading && !error && visibleAppointments.length > 0 ? (
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
                {visibleAppointments.map((appointment) => (
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
                          isCalendarExporting={isCalendarExporting}
                          isMutating={isFormSubmitting}
                          onCalendarClick={handleCalendarClick}
                          onEdit={handleEditAppointment}
                          onRemove={handleRemoveAppointment}
                        />
                      </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 xl:hidden">
            {visibleAppointments.map((appointment) => (
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

                <AppointmentCardActions
                  appointment={appointment}
                  isCalendarExporting={isCalendarExporting}
                  isMutating={isFormSubmitting}
                  onCalendarClick={handleCalendarClick}
                  onEdit={handleEditAppointment}
                  onRemove={handleRemoveAppointment}
                />
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

      <Modal
        isOpen={Boolean(appointmentToRemove)}
        onClose={handleCloseRemoveConfirmation}
        title="Remover atendimento"
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-zinc-700">
            Remover o atendimento de{' '}
            <strong className="font-semibold text-zinc-950">
              {appointmentToRemove
                ? getAppointmentSubject(appointmentToRemove)
                : ''}
            </strong>{' '}
            em{' '}
            {appointmentToRemove
              ? `${formatDate(appointmentToRemove.appointmentDate)} às ${formatTime(appointmentToRemove.appointmentTime)}`
              : ''}
            ? Esta ação não pode ser desfeita.
          </p>

          {removeErrorMessage ? (
            <p className="text-sm text-red-700" role="alert">
              {removeErrorMessage}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              disabled={removeMutation.isPending}
              onClick={handleCloseRemoveConfirmation}
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button
              disabled={removeMutation.isPending}
              onClick={() => void handleConfirmRemove()}
              variant="danger"
            >
              {removeMutation.isPending ? 'Removendo...' : 'Remover atendimento'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
