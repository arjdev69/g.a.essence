import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { calculateSaleResult, calculateStockAfterMovement } from '../../domain/products/productCalculations'
import { formatCurrencyBRL } from '../../utils/formatCurrencyBRL'
import { cn } from '../../utils/cn'
import type { ProductStatus } from '../../domain/products/product.types'
import {
  stockMovementSchema,
  type StockMovementFormData,
  type StockMovementFormInput,
} from './stockMovement.schema'

type ProductOption = {
  label: string
  value: string
}

type StockSaleFormProps = {
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
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'good' | 'warn' | 'bad'
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

export function StockSaleForm({
  averageCost,
  currentStock,
  defaultValues,
  errorMessage,
  isSubmitting = false,
  onCancel,
  onSubmit,
  productOptions,
  productStatus = 'active',
  submitLabel = 'Registrar venda',
}: StockSaleFormProps) {
  const {
    control,
    formState: { errors, isSubmitting: isFormSubmitting },
    handleSubmit,
    register,
    setValue,
  } = useForm<StockMovementFormInput, unknown, StockMovementFormData>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      amountReceived: defaultValues?.amountReceived ?? 0,
      adjustmentDelta: undefined,
      averageCost,
      currentStock,
      occurredAt: defaultValues?.occurredAt ?? formatDateTimeLocal(new Date()),
      notes: defaultValues?.notes ?? '',
      paymentMethod: defaultValues?.paymentMethod ?? undefined,
      productId: defaultValues?.productId ?? '',
      productStatus,
      quantity: defaultValues?.quantity ?? 1,
      receiptStatus: defaultValues?.receiptStatus ?? undefined,
      type: 'sale',
      unitCost: undefined,
      unitSalePrice: defaultValues?.unitSalePrice ?? '',
    },
  })

  const disabled = isSubmitting || isFormSubmitting

  const quantity = useWatch({
    control,
    name: 'quantity',
  })
  const unitSalePrice = useWatch({
    control,
    name: 'unitSalePrice',
  })
  const receiptStatus = useWatch({
    control,
    name: 'receiptStatus',
  })
  const amountReceived = useWatch({
    control,
    name: 'amountReceived',
  })

  const quantityValue = toNumber(quantity)
  const unitSalePriceValue = toNumber(unitSalePrice)
  const amountReceivedValue = toNumber(amountReceived)
  const currentStockValue = typeof currentStock === 'number' ? currentStock : null
  const averageCostValue = typeof averageCost === 'number' ? averageCost : null

  const saleResult = useMemo(() => {
    if (
      quantityValue === null ||
      quantityValue <= 0 ||
      unitSalePriceValue === null ||
      unitSalePriceValue <= 0 ||
      averageCostValue === null
    ) {
      return null
    }

    return calculateSaleResult(
      quantityValue,
      unitSalePriceValue,
      averageCostValue,
    )
  }, [averageCostValue, quantityValue, unitSalePriceValue])

  const stockAfterSale =
    currentStockValue !== null && quantityValue !== null
      ? (() => {
          try {
            return calculateStockAfterMovement(currentStockValue, -quantityValue)
          } catch {
            return null
          }
        })()
      : null

  useEffect(() => {
    if (receiptStatus === 'received' && saleResult) {
      setValue('amountReceived', saleResult.revenueValue, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }

    if (receiptStatus === 'pending') {
      setValue('amountReceived', 0, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
  }, [receiptStatus, saleResult, setValue])

  const isPartialReceipt = receiptStatus === 'partial'
  const isPendingReceipt = receiptStatus === 'pending'
  const isReceivedReceipt = receiptStatus === 'received'

  const estimatedCost =
    saleResult === null ? 'Pendente' : formatCurrencyBRL(saleResult.costValue)
  const estimatedRevenue =
    saleResult === null ? 'Pendente' : formatCurrencyBRL(saleResult.revenueValue)
  const estimatedProfit =
    saleResult === null ? 'Pendente' : formatCurrencyBRL(saleResult.grossProfitValue)
  const receivedValue =
    amountReceivedValue === null ? 'Pendente' : formatCurrencyBRL(amountReceivedValue)
  const receiptHelpId = 'stock-sale-receipt-help'

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
          description="Selecione o produto vendido e informe a quantidade."
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            disabled={disabled}
            error={errors.quantity?.message}
            label="Quantidade"
            min={1}
            step="1"
            type="number"
            {...register('quantity')}
          />

          <Input
            disabled={disabled}
            error={errors.unitSalePrice?.message}
            label="Preco unitario"
            min={0}
            placeholder="0,00"
            step="0.01"
            type="number"
            {...register('unitSalePrice')}
          />
        </div>

        <p className="text-sm text-zinc-500">
          Quando o produto estiver com preco aberto, defina um valor maior que
          zero para concluir a venda.
        </p>
      </section>

      <section className="space-y-4">
        <FieldsetTitle
          description="Defina como o valor foi recebido e quando a venda ocorreu."
          title="Recebimento"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            disabled={disabled}
            error={errors.paymentMethod?.message}
            label="Forma de pagamento"
            aria-describedby={receiptHelpId}
            {...register('paymentMethod')}
            options={[
              { label: 'Selecione', value: '' },
              { label: 'Pix', value: 'pix' },
              { label: 'Cartao', value: 'card' },
              { label: 'Dinheiro', value: 'cash' },
            ]}
          />

          <Select
            disabled={disabled}
            error={errors.receiptStatus?.message}
            label="Status de recebimento"
            aria-describedby={receiptHelpId}
            {...register('receiptStatus')}
            options={[
              { label: 'Selecione', value: '' },
              { label: 'Recebido', value: 'received' },
              { label: 'Pendente', value: 'pending' },
              { label: 'Parcial', value: 'partial' },
            ]}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            disabled={disabled || !isPartialReceipt}
            error={errors.amountReceived?.message}
            label="Valor recebido"
            min={0}
            placeholder="0,00"
            step="0.01"
            type="number"
            aria-describedby={receiptHelpId}
            {...register('amountReceived')}
          />

          <Input
            disabled={disabled}
            error={errors.occurredAt?.message}
            label="Data operacional"
            type="datetime-local"
            aria-describedby={receiptHelpId}
            {...register('occurredAt')}
          />
        </div>

        <p id={receiptHelpId} className="text-sm text-zinc-500">
          {isReceivedReceipt
            ? 'Recebido preenche o valor total da venda.'
            : isPendingReceipt
              ? 'Pendente exige valor recebido igual a zero.'
              : 'Parcial permite informar um valor maior que zero e menor que o total.'}
        </p>
      </section>

      <Card className="border-stone-200 bg-stone-50 p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryItem
            label="Saldo atual"
            value={currentStockValue === null ? '-' : currentStockValue.toLocaleString('pt-BR')}
          />
          <SummaryItem
            label="Saldo apos venda"
            tone={stockAfterSale === null ? 'warn' : 'default'}
            value={
              stockAfterSale === null
                ? 'Estoque insuficiente'
                : stockAfterSale.toLocaleString('pt-BR')
            }
          />
          <SummaryItem label="Receita" tone={saleResult ? 'good' : 'warn'} value={estimatedRevenue} />
          <SummaryItem label="Custo estimado" value={estimatedCost} />
          <SummaryItem
            label="Lucro bruto"
            tone={saleResult ? 'good' : 'warn'}
            value={estimatedProfit}
          />
          <SummaryItem label="Recebido" tone="default" value={receivedValue} />
        </div>
      </Card>

      {(averageCostValue === null || productStatus !== 'active') ? (
        <Card className="border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">
            {productStatus !== 'active'
              ? 'Produto inativo nao pode receber movimentacao.'
              : 'Venda exige custo medio definido.'}
          </p>
        </Card>
      ) : null}

      <section className="space-y-2">
        <FieldsetTitle
          description="Observacao opcional para auditoria e conferencia."
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
            placeholder="Venda no balcao, pedido recorrente ou ajuste manual"
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
