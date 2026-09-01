import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import {
  professionalSchema,
  type ProfessionalFormData,
  type ProfessionalFormInput,
} from './professional.schema'

type ProfessionalFormProps = {
  defaultValues?: Partial<ProfessionalFormData>
  errorMessage?: string
  isSubmitting?: boolean
  onCancel?: () => void
  onSubmit: (input: ProfessionalFormData) => Promise<void> | void
  submitLabel?: string
}

export function ProfessionalForm({
  defaultValues,
  errorMessage,
  isSubmitting = false,
  onCancel,
  onSubmit,
  submitLabel = 'Salvar profissional',
}: ProfessionalFormProps) {
  const {
    formState: { errors, isSubmitting: isFormSubmitting },
    handleSubmit,
    register,
  } = useForm<ProfessionalFormInput, unknown, ProfessionalFormData>({
    resolver: zodResolver(professionalSchema),
    defaultValues: {
      active: defaultValues?.active ?? true,
      defaultClinicFeePercentage:
        defaultValues?.defaultClinicFeePercentage ?? 30,
      name: defaultValues?.name ?? '',
      phone: defaultValues?.phone ?? '',
      pixKey: defaultValues?.pixKey ?? '',
      specialty: defaultValues?.specialty ?? '',
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
        autoComplete="name"
        className="min-h-11 text-base sm:text-sm"
        disabled={disabled}
        error={errors.name?.message}
        label="Nome"
        {...register('name')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          autoComplete="tel"
          className="min-h-11 text-base sm:text-sm"
          disabled={disabled}
          error={errors.phone?.message}
          label="Telefone"
          type="tel"
          {...register('phone')}
        />

        <Input
          className="min-h-11 text-base sm:text-sm"
          disabled={disabled}
          error={errors.specialty?.message}
          label="Especialidade"
          {...register('specialty')}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          className="min-h-11 text-base sm:text-sm"
          disabled={disabled}
          error={errors.pixKey?.message}
          label="Chave PIX"
          {...register('pixKey')}
        />

        <Input
          className="min-h-11 text-base sm:text-sm"
          disabled={disabled}
          error={errors.defaultClinicFeePercentage?.message}
          label="Percentual padrao"
          max={100}
          min={0}
          step="0.01"
          type="number"
          {...register('defaultClinicFeePercentage')}
        />
      </div>

      <label className="flex min-h-11 items-center gap-3 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900">
        <input
          className="h-4 w-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-700"
          disabled={disabled}
          type="checkbox"
          {...register('active')}
        />
        Profissional ativo
      </label>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            className="min-h-11"
            disabled={disabled}
            onClick={onCancel}
            type="button"
            variant="secondary"
          >
            Cancelar
          </Button>
        ) : null}
        <Button className="min-h-11" disabled={disabled} type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
