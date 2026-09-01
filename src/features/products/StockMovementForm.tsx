import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import {
  calculateInventoryValue,
  calculateStockAfterMovement,
  calculateStockDelta,
} from '../../domain/products/productCalculations'
import type { ProductStatus, StockMovementType } from '../../domain/products/product.types'
import { cn } from '../../utils/cn'
import { formatCurrencyBRL } from '../../utils/formatCurrencyBRL'
import {
  stockMovementSchema,
  type StockMovementFormData,
  type StockMovementFormInput,
} from './stockMovement.schema'

type ProductOption = {
  label: string
  value: string
}

type StockMovementFormProps = {
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

function SummaryItem({
  label,
  tone = 'default',
  value,
}: {
  label: string
  tone?: 'default' | 'good' | 'warn' | 'bad'
  value: string
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p
        className={cn(
          'mt-2 text-lg font-semibold',
          tone === 'good' && 'text-emerald-700',
          tone === 'warn' && 'text-amber-700',
          tone === 'bad' && 'text-red-700',
          tone === 'default' && 'text-zinc-950',
        )}
      >
        {value}
      </p>
    </div>
  )
}

function getMovementLabel(type: StockMovementType) {
  if (type === 'internal_use') {
    return 'Uso interno'
  }

  if (type === 'loss') {
    return 'Perda'
  }

  return 'Ajuste'
}

export function StockMovementForm({
  averageCost,
  currentStock,
  defaultValues,
  errorMessage,
  isSubmitting = false,
  onCancel,
  onSubmit,
  productOptions,
  productStatus = 'active',
  submitLabel = 'Registrar movimentacao',
}: StockMovementFormProps) {
  const {
    control,
    formState: { errors, isSubmitting: isFormSubmitting },
    handleSubmit,
    register,
  } = useForm<StockMovementFormInput, unknown, StockMovementFormData>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      adjustmentDelta: defaultValues?.adjustmentDelta ?? -1,
      amountReceived: 0,
      averageCost,
      currentStock,
      notes: defaultValues?.notes ?? '',
      occurredAt: defaultValues?.occurredAt ?? formatDateTimeLocal(new Date()),
      paymentMethod: undefined,
      productId: defaultValues?.productId ?? '',
      productStatus,
      quantity: defaultValues?.quantity ?? 1,
      receiptStatus: undefined,
      type: defaultValues?.type ?? 'internal_use',
      unitCost: undefined,
      unitSalePrice: undefined,
    },
  })

  const disabled = isSubmitting || isFormSubmitting
  const type = useWatch({
    control,
    name: 'type',
  })
  const quantity = useWatch({
    control,
    name: 'quantity',
  })
  const adjustmentDelta = useWatch({
    control,
    name: 'adjustmentDelta',
  })

  const quantityValue = toNumber(quantity)
  const adjustmentDeltaValue = toNumber(adjustmentDelta)
  const currentStockValue = typeof currentStock === 'number' ? currentStock : null
  const averageCostValue = typeof averageCost === 'number' ? averageCost : null

  const stockDelta = useMemo(() => {
    if (quantityValue === null) {
      return null
    }

    try {
      return calculateStockDelta(
        type,
        quantityValue,
        adjustmentDeltaValue ?? undefined,
      )
    } catch {
      return null
    }
  }, [adjustmentDeltaValue, quantityValue, type])

  const nextStock =
    currentStockValue !== null && stockDelta !== null
      ? (() => {
          try {
            return calculateStockAfterMovement(currentStockValue, stockDelta)
          } catch {
            return null
          }
        })()
      : null

  const inventoryValue =
    nextStock !== null
      ? calculateInventoryValue(nextStock, averageCostValue)
      : null

  const summaryLabel = getMovementLabel(type)
  const deltaLabel =
    stockDelta === null
      ? '-'
      : stockDelta > 0
        ? `+${stockDelta.toLocaleString('pt-BR')}`
        : stockDelta.toLocaleString('pt-BR')
  const movementHelpId = 'stock-movement-help'

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
      <input type="hidden" defaultValue={productStatus} {...register('productStatus')} />
      {typeof currentStock === 'number' ? (
        <input
          type="hidden"
          defaultValue={currentStock}
          {...register('currentStock')}
        />
      ) : null}
      {typeof averageCost === 'number' ? (
        <input
          type="hidden"
          defaultValue={averageCost}
          {...register('averageCost')}
        />
      ) : null}

      <section className="space-y-4">
        <FieldsetTitle
          description="Escolha o produto e o tipo de movimentacao."
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

        <Select
          disabled={disabled}
          error={errors.type?.message}
          label="Tipo de movimentacao"
          aria-describedby={movementHelpId}
          {...register('type')}
          options={[
            { label: 'Uso interno', value: 'internal_use' },
            { label: 'Perda', value: 'loss' },
            { label: 'Ajuste', value: 'adjustment' },
          ]}
        />
      </section>

      <section className="space-y-4">
        <FieldsetTitle
          description={
            type === 'adjustment'
              ? 'Informe a alteracao assinada de estoque.'
              : 'Informe a quantidade da baixa de estoque.'
          }
          title="Movimentacao"
        />

        {type === 'adjustment' ? (
          <Input
            disabled={disabled}
            error={errors.adjustmentDelta?.message}
            label="Ajuste de estoque"
            placeholder="-1"
            step="1"
            type="number"
            aria-describedby={movementHelpId}
            {...register('adjustmentDelta')}
          />
        ) : (
          <Input
            disabled={disabled}
            error={errors.quantity?.message}
            label={summaryLabel}
            min={1}
            step="1"
            type="number"
            aria-describedby={movementHelpId}
            {...register('quantity')}
          />
        )}

        <Input
          disabled={disabled}
          error={errors.occurredAt?.message}
          label="Data operacional"
          type="datetime-local"
          aria-describedby={movementHelpId}
          {...register('occurredAt')}
        />

        <p id={movementHelpId} className="text-sm text-zinc-500">
          {type === 'adjustment'
            ? 'Ajuste usa delta assinado: positivo aumenta e negativo reduz o saldo.'
            : 'Uso interno e perda reduzem o saldo sem gerar receita.'}
        </p>
      </section>

      <Card className="border-stone-200 bg-stone-50 p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryItem
            label="Saldo atual"
            value={currentStockValue === null ? '-' : currentStockValue.toLocaleString('pt-BR')}
          />
          <SummaryItem
            label="Delta estimado"
            tone={stockDelta === null ? 'warn' : stockDelta >= 0 ? 'good' : 'bad'}
            value={deltaLabel}
          />
          <SummaryItem
            label="Saldo apos movimentacao"
            tone={nextStock === null ? 'warn' : 'default'}
            value={nextStock === null ? 'Indisponivel' : nextStock.toLocaleString('pt-BR')}
          />
          <SummaryItem
            label="Valor em estoque estimado"
            tone={inventoryValue === null ? 'warn' : 'default'}
            value={inventoryValue === null ? 'Pendente' : formatCurrencyBRL(inventoryValue)}
          />
          <SummaryItem
            label="Custo medio"
            tone={averageCostValue === null ? 'warn' : 'default'}
            value={averageCostValue === null ? 'Pendente' : formatCurrencyBRL(averageCostValue)}
          />
          <SummaryItem
            label="Status"
            tone={productStatus === 'active' ? 'good' : 'bad'}
            value={productStatus === 'active' ? 'Ativo' : 'Inativo'}
          />
        </div>
      </Card>

      {productStatus !== 'active' ? (
        <Card className="border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">
            Produto inativo nao pode receber movimentacao.
          </p>
        </Card>
      ) : null}

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
              'min-h-28 w-full resize-y rounded-lg border border-stone-300 bg-white px-3 py-2 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-zinc-500 sm:text-sm',
              errors.notes &&
                'border-red-500 focus:border-red-600 focus:ring-red-600/20',
            )}
            disabled={disabled}
            id="notes"
            placeholder="Baixa por uso interno, quebra, inventario ou conferencia"
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
