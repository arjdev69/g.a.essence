import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { cn } from '../../utils/cn'
import { formatCurrencyBRL } from '../../utils/formatCurrencyBRL'
import {
  stockMovementSchema,
  type StockMovementFormData,
  type StockMovementFormInput,
} from './stockMovement.schema'
import type { ProductStatus } from '../../domain/products/product.types'

type ProductOption = {
  label: string
  value: string
}

type StockEntryFormProps = {
  averageCost?: number | null
  currentStock?: number
  defaultValues?: Partial<StockMovementFormData>
  errorMessage?: string
  isSubmitting?: boolean
  onCancel?: () => void
  onSubmit: (input: StockMovementFormData) => Promise<void> | void
  productOptions: ProductOption[]
  productStatus?: ProductStatus
  submitLabel?: string
}

function formatDateTimeLocal(value: Date) {
  const localDate = new Date(value.getTime() - value.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

function toNumber(value: unknown) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim()

    return trimmedValue.length > 0 ? Number(trimmedValue) : null
  }

  return null
}

function FieldsetTitle({
  description,
  title,
}: {
  description: string
  title: string
}) {
  return (
    <div className="space-y-1">
      <h3 className="text-base font-semibold text-zinc-950">{title}</h3>
      <p className="text-sm text-zinc-500">{description}</p>
    </div>
  )
}

export function StockEntryForm({
  averageCost,
  currentStock,
  defaultValues,
  errorMessage,
  isSubmitting = false,
  onCancel,
  onSubmit,
  productOptions,
  productStatus = 'active',
  submitLabel = 'Registrar entrada',
}: StockEntryFormProps) {
  const {
    control,
    formState: { errors, isSubmitting: isFormSubmitting },
    handleSubmit,
    register,
  } = useForm<StockMovementFormInput, unknown, StockMovementFormData>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      amountReceived: 0,
      adjustmentDelta: undefined,
      currentStock,
      occurredAt: defaultValues?.occurredAt ?? formatDateTimeLocal(new Date()),
      notes: defaultValues?.notes ?? '',
      paymentMethod: undefined,
      productId: defaultValues?.productId ?? '',
      productStatus,
      quantity: defaultValues?.quantity ?? 1,
      receiptStatus: undefined,
      type: 'purchase',
      unitCost: defaultValues?.unitCost ?? '',
      unitSalePrice: undefined,
      averageCost,
    },
  })

  const disabled = isSubmitting || isFormSubmitting
  const quantity = useWatch({
    control,
    name: 'quantity',
  })

  const quantityValue = toNumber(quantity)
  const currentStockValue = typeof currentStock === 'number' ? currentStock : null
  const estimatedStock =
    currentStockValue !== null && quantityValue !== null
      ? currentStockValue + quantityValue
      : null
  const inventoryValue =
    estimatedStock !== null && typeof averageCost === 'number'
      ? formatCurrencyBRL(estimatedStock * averageCost)
      : 'Pendente'
  const entryHelpId = 'stock-entry-help'

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {errorMessage ? (
        <p
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <input type="hidden" {...register('type')} />
      <input type="hidden" {...register('productStatus')} />

      <section className="space-y-4">
        <FieldsetTitle
          description="Escolha o produto que vai receber a entrada."
          title="Identificacao"
        />

        <Select
          disabled={disabled}
          error={errors.productId?.message}
          label="Produto"
          {...register('productId')}
          options={[
            { label: 'Selecione um produto', value: '' },
            ...productOptions,
          ]}
        />
      </section>

      <section className="space-y-4">
        <FieldsetTitle
          description="Informe a quantidade, o custo unitario e a data operacional."
          title="Movimentacao"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            disabled={disabled}
            error={errors.quantity?.message}
            label="Quantidade"
            min={1}
            step="1"
            type="number"
            aria-describedby={entryHelpId}
            {...register('quantity')}
          />

          <Input
            disabled={disabled}
            error={errors.unitCost?.message}
            label="Custo unitario opcional"
            min={0}
            placeholder="0,00"
            step="0.01"
            type="number"
            aria-describedby={entryHelpId}
            {...register('unitCost')}
          />
        </div>

        <Input
          disabled={disabled}
          error={errors.occurredAt?.message}
          label="Data operacional"
          type="datetime-local"
          aria-describedby={entryHelpId}
          {...register('occurredAt')}
        />

        <p id={entryHelpId} className="text-sm text-zinc-500">
          A entrada aumenta o saldo e pode ser usada para registrar estoque
          inicial manual.
        </p>
      </section>

      <Card className="border-stone-200 bg-stone-50 p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Saldo atual
            </p>
            <p className="mt-2 text-lg font-semibold text-zinc-950">
              {currentStockValue === null ? '-' : currentStockValue.toLocaleString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Saldo apos entrada
            </p>
            <p className="mt-2 text-lg font-semibold text-zinc-950">
              {estimatedStock === null
                ? '-'
                : estimatedStock.toLocaleString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Valor em estoque estimado
            </p>
            <p
              className={cn(
                'mt-2 text-lg font-semibold',
                inventoryValue === 'Pendente'
                  ? 'text-amber-700'
                  : 'text-zinc-950',
              )}
            >
              {inventoryValue}
            </p>
          </div>
        </div>
      </Card>

      <section className="space-y-2">
        <FieldsetTitle
          description="Observacao opcional para conferencia posterior."
          title="Observacoes"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-900" htmlFor="notes">
            Observacao
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
            placeholder="Entrada manual, compra ou ajuste de inventario"
            {...register('notes')}
          />
          {errors.notes ? (
            <p className="text-sm text-red-700" id="notes-error" role="alert">
              {errors.notes.message}
            </p>
          ) : null}
        </div>
      </section>

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
