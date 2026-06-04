import { zodResolver } from '@hookform/resolvers/zod'
import type { ChangeEvent } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { calculateAppointmentSplit } from '../../domain/appointments/calculateAppointmentSplit'
import type { AppointmentStatus } from '../../domain/appointments/appointment.types'
import { formatCurrencyBRL } from '../../utils/formatCurrencyBRL'
import { cn } from '../../utils/cn'
import {
  appointmentSchema,
  type AppointmentFormData,
  type AppointmentFormInput,
} from './appointment.schema'

type AppointmentOption = {
  id: string
  name: string
}

type AppointmentServiceOption = AppointmentOption & {
  clinicFeePercentage: number
  defaultValue: number
}

type AppointmentFormProps = {
  defaultValues?: Partial<AppointmentFormData>
  errorMessage?: string
  isSubmitting?: boolean
  onCancel?: () => void
  onSubmit: (input: AppointmentFormData) => Promise<void> | void
  patientOptions: AppointmentOption[]
  professionalOptions: AppointmentOption[]
  serviceOptions: AppointmentServiceOption[]
  submitLabel?: string
}

const statusOptions: Array<{ label: string; value: AppointmentStatus }> = [
  { label: 'Agendado', value: 'scheduled' },
  { label: 'Realizado', value: 'completed' },
  { label: 'Pago', value: 'paid' },
  { label: 'Cancelado', value: 'cancelled' },
  { label: 'Faltou', value: 'no_show' },
]

function toSelectOptions(
  placeholder: string,
  options: AppointmentOption[],
) {
  return [
    { label: placeholder, value: '' },
    ...options.map((option) => ({
      label: option.name,
      value: option.id,
    })),
  ]
}

function numberFromFormValue(value: unknown, fallback = 0) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim()

    if (!trimmedValue) {
      return fallback
    }

    const numericValue = Number(trimmedValue)

    return Number.isFinite(numericValue) ? numericValue : fallback
  }

  return fallback
}

export function AppointmentForm({
  defaultValues,
  errorMessage,
  isSubmitting = false,
  onCancel,
  onSubmit,
  patientOptions,
  professionalOptions,
  serviceOptions,
  submitLabel = 'Salvar atendimento',
}: AppointmentFormProps) {
  const {
    control,
    formState: { errors, isSubmitting: isFormSubmitting },
    handleSubmit,
    register,
    setValue,
  } = useForm<AppointmentFormInput, unknown, AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      appointmentDate: defaultValues?.appointmentDate ?? '',
      appointmentTime: defaultValues?.appointmentTime ?? '',
      clinicFeePercentage: defaultValues?.clinicFeePercentage ?? 30,
      description: defaultValues?.description ?? '',
      notes: defaultValues?.notes ?? '',
      patientId: defaultValues?.patientId ?? '',
      professionalId: defaultValues?.professionalId ?? '',
      serviceId: defaultValues?.serviceId ?? '',
      status: defaultValues?.status ?? 'scheduled',
      value: defaultValues?.value ?? 0,
    },
  })

  const disabled = isSubmitting || isFormSubmitting
  const { onChange: onServiceChange, ...serviceField } = register('serviceId')
  const watchedValue = useWatch({ control, name: 'value' })
  const watchedClinicFeePercentage = useWatch({
    control,
    name: 'clinicFeePercentage',
  })
  const currentValue = numberFromFormValue(watchedValue)
  const currentClinicFeePercentage = numberFromFormValue(
    watchedClinicFeePercentage,
    30,
  )
  const split = calculateAppointmentSplit(
    currentValue,
    currentClinicFeePercentage,
  )

  function handleServiceChange(event: ChangeEvent<HTMLSelectElement>) {
    void onServiceChange(event)

    const selectedService = serviceOptions.find(
      (service) => service.id === event.target.value,
    )

    if (!selectedService) {
      return
    }

    setValue('value', selectedService.defaultValue, {
      shouldDirty: true,
      shouldValidate: true,
    })
    setValue('clinicFeePercentage', selectedService.clinicFeePercentage, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {errorMessage ? (
        <p
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <Select
        disabled={disabled}
        error={errors.patientId?.message}
        label="Paciente"
        options={toSelectOptions('Selecione um paciente', patientOptions)}
        {...register('patientId')}
      />

      <Select
        disabled={disabled}
        error={errors.professionalId?.message}
        label="Profissional"
        options={toSelectOptions(
          'Selecione um profissional',
          professionalOptions,
        )}
        {...register('professionalId')}
      />

      <Select
        disabled={disabled}
        error={errors.serviceId?.message}
        label="Servico"
        onChange={handleServiceChange}
        options={toSelectOptions('Selecione um servico', serviceOptions)}
        {...serviceField}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          disabled={disabled}
          error={errors.appointmentDate?.message}
          label="Data"
          type="date"
          {...register('appointmentDate')}
        />

        <Input
          disabled={disabled}
          error={errors.appointmentTime?.message}
          label="Hora"
          type="time"
          {...register('appointmentTime')}
        />
      </div>

      <Select
        disabled={disabled}
        error={errors.status?.message}
        label="Status"
        options={statusOptions}
        {...register('status')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          disabled={disabled}
          error={errors.value?.message}
          label="Valor"
          min={0}
          step="0.01"
          type="number"
          {...register('value')}
        />

        <Input
          disabled={disabled}
          error={errors.clinicFeePercentage?.message}
          label="Percentual"
          max={100}
          min={0}
          step="0.01"
          type="number"
          {...register('clinicFeePercentage')}
        />
      </div>

      <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
        <p className="text-sm font-medium text-zinc-900">Calculo</p>
        <dl className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase text-zinc-500">
              Valor total
            </dt>
            <dd className="mt-1 text-sm font-semibold text-zinc-950">
              {formatCurrencyBRL(currentValue)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-zinc-500">
              Clinica
            </dt>
            <dd className="mt-1 text-sm font-semibold text-zinc-950">
              {formatCurrencyBRL(split.clinicFeeValue)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-zinc-500">
              Profissional
            </dt>
            <dd className="mt-1 text-sm font-semibold text-zinc-950">
              {formatCurrencyBRL(split.professionalGainValue)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-900" htmlFor="notes">
          Observacoes
        </label>
        <textarea
          aria-describedby={errors.notes ? 'notes-error' : undefined}
          aria-invalid={Boolean(errors.notes)}
          className={cn(
            'min-h-28 w-full resize-y rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-zinc-500',
            errors.notes &&
              'border-red-500 focus:border-red-600 focus:ring-red-600/20',
          )}
          disabled={disabled}
          id="notes"
          {...register('notes')}
        />
        {errors.notes ? (
          <p className="text-sm text-red-700" id="notes-error" role="alert">
            {errors.notes.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            disabled={disabled}
            onClick={onCancel}
            type="button"
            variant="secondary"
          >
            Cancelar
          </Button>
        ) : null}
        <Button disabled={disabled} type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
