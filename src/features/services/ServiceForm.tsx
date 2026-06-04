import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import {
  serviceSchema,
  type ServiceFormData,
  type ServiceFormInput,
} from './service.schema'

type ServiceFormProps = {
  defaultValues?: Partial<ServiceFormData>
  errorMessage?: string
  isSubmitting?: boolean
  onCancel?: () => void
  onSubmit: (input: ServiceFormData) => Promise<void> | void
  submitLabel?: string
}

export function ServiceForm({
  defaultValues,
  errorMessage,
  isSubmitting = false,
  onCancel,
  onSubmit,
  submitLabel = 'Salvar servico',
}: ServiceFormProps) {
  const {
    formState: { errors, isSubmitting: isFormSubmitting },
    handleSubmit,
    register,
  } = useForm<ServiceFormInput, unknown, ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      active: defaultValues?.active ?? true,
      clinicFeePercentage: defaultValues?.clinicFeePercentage ?? 30,
      defaultValue: defaultValues?.defaultValue ?? 0,
      durationMinutes: defaultValues?.durationMinutes ?? 60,
      name: defaultValues?.name ?? '',
    },
  })

  const disabled = isSubmitting || isFormSubmitting

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

      <Input
        disabled={disabled}
        error={errors.name?.message}
        label="Nome"
        {...register('name')}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          disabled={disabled}
          error={errors.defaultValue?.message}
          label="Valor padrao"
          min={0}
          step="0.01"
          type="number"
          {...register('defaultValue')}
        />

        <Input
          disabled={disabled}
          error={errors.durationMinutes?.message}
          label="Duracao"
          min={1}
          step="1"
          type="number"
          {...register('durationMinutes')}
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

      <label className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900">
        <input
          className="h-4 w-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-700"
          disabled={disabled}
          type="checkbox"
          {...register('active')}
        />
        Servico ativo
      </label>

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
