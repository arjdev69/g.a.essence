import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { cn } from '../../utils/cn'
import {
  patientSchema,
  type PatientFormData,
  type PatientFormInput,
} from './patient.schema'

type PatientFormProps = {
  defaultValues?: Partial<PatientFormData>
  errorMessage?: string
  isSubmitting?: boolean
  onCancel?: () => void
  onSubmit: (input: PatientFormData) => Promise<void> | void
  submitLabel?: string
}

export function PatientForm({
  defaultValues,
  errorMessage,
  isSubmitting = false,
  onCancel,
  onSubmit,
  submitLabel = 'Salvar paciente',
}: PatientFormProps) {
  const {
    formState: { errors, isSubmitting: isFormSubmitting },
    handleSubmit,
    register,
  } = useForm<PatientFormInput, unknown, PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      active: defaultValues?.active ?? true,
      birthDate: defaultValues?.birthDate ?? '',
      name: defaultValues?.name ?? '',
      notes: defaultValues?.notes ?? '',
      phone: defaultValues?.phone ?? '',
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
        disabled={disabled}
        error={errors.name?.message}
        label="Nome"
        {...register('name')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          autoComplete="tel"
          disabled={disabled}
          error={errors.phone?.message}
          label="Telefone"
          type="tel"
          {...register('phone')}
        />

        <Input
          disabled={disabled}
          error={errors.birthDate?.message}
          label="Data de nascimento"
          type="date"
          {...register('birthDate')}
        />
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
            errors.notes && 'border-red-500 focus:border-red-600 focus:ring-red-600/20',
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

      <label className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900">
        <input
          className="h-4 w-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-700"
          disabled={disabled}
          type="checkbox"
          {...register('active')}
        />
        Paciente ativo
      </label>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button disabled={disabled} onClick={onCancel} type="button" variant="secondary">
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
