import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowDownToLine,
  CircleDollarSign,
  CreditCard,
  Download,
  FilterX,
  HandCoins,
  History,
  Banknote,
  Package,
  PackageX,
  Pencil,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  UserX,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
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
import { calculateInventoryValue, isLowStock } from '../../domain/products/productCalculations'
import type {
  ProductDTO,
  ProductFilters,
  ProductStatus,
  ProductSummaryDTO,
  ProductSummaryFilters,
} from '../../domain/products/product.types'
import { productRepository } from '../../repositories/product.repository'
import { formatCurrencyBRL } from '../../utils/formatCurrencyBRL'
import { deleteProductImageByUrl } from '../../services/storage/productImageStorage'
import { ProductForm } from './ProductForm'
import { ProductImageThumbnail } from './ProductImage'
import { StockEntryForm } from './StockEntryForm'
import { StockMovementForm } from './StockMovementForm'
import { StockSaleForm } from './StockSaleForm'
import type { ProductFormData } from './product.schema'
import { stockMovementRepository } from '../../repositories/stockMovement.repository'
import { productSalesSummaryRepository } from '../../repositories/productSalesSummary.repository'
import { downloadFile } from '../../services/export/downloadFile'
import type {
  StockMovementFormData,
} from './stockMovement.schema'
import type {
  CreateStockMovementInput,
  ProductSalesSummaryDTO,
  StockMovementDTO,
} from '../../domain/products/product.types'

type StatusFilter = 'all' | ProductStatus
type ToggleFilter = 'all' | 'yes'

type ProductPageFilters = {
  category: string
  lowStock: ToggleFilter
  paymentPending: ToggleFilter
  pendingData: ToggleFilter
  search: string
  status: StatusFilter
}

type ProductsPageProps = {
  createRequest?: number
  movementRequest?: number
}

type ProductFormMode = { type: 'create' } | { product: ProductDTO; type: 'edit' }

type MovementFormMode =
  | { product: ProductDTO; type: 'entry' }
  | { product: ProductDTO; type: 'movement' }
  | { product: ProductDTO; type: 'sale' }

const initialFilters: ProductPageFilters = {
  category: 'all',
  lowStock: 'all',
  paymentPending: 'all',
  pendingData: 'all',
  search: '',
  status: 'all',
}

function toRepositoryFilters(
  filters: ProductPageFilters,
): ProductFilters {
  return {
    category: filters.category === 'all' ? undefined : filters.category,
    lowStock: filters.lowStock === 'yes',
    paymentPending: filters.paymentPending === 'yes',
    pendingData: filters.pendingData === 'yes',
    search: filters.search.trim() || undefined,
    status: filters.status === 'all' ? undefined : filters.status,
  }
}

function formatStock(value: number) {
  return value.toLocaleString('pt-BR', {
    maximumFractionDigits: 0,
  })
}

function formatSalePrice(product: ProductDTO) {
  if (product.salePriceOpen) {
    return 'Aberto'
  }

  if (product.salePrice === null) {
    return 'Pendente'
  }

  return formatCurrencyBRL(product.salePrice)
}

function formatInventoryValue(product: ProductDTO) {
  const value = calculateInventoryValue(
    product.currentStock,
    product.averageCost,
  )

  return value === null ? 'Pendente' : formatCurrencyBRL(value)
}

function formatProductRevenue(
  revenueValue: number | undefined,
  isLoading: boolean,
  hasError: boolean,
) {
  if (hasError) {
    return '-'
  }

  if (isLoading) {
    return 'Carregando...'
  }

  return formatCurrencyBRL(revenueValue ?? 0)
}

function formatProductGrossProfit(
  grossProfitValue: number | undefined,
  isLoading: boolean,
  hasError: boolean,
) {
  if (hasError) {
    return '-'
  }

  if (isLoading) {
    return 'Carregando...'
  }

  return formatCurrencyBRL(grossProfitValue ?? 0)
}

function formatPeriodLabel(dateValue: string) {
  const [year, month, day] = dateValue.split('-')

  if (!year || !month || !day) {
    return dateValue
  }

  return `${day}/${month}/${year}`
}

function formatMovementDate(value: string) {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsedDate)
}

function formatMovementType(type: StockMovementDTO['type']) {
  switch (type) {
    case 'adjustment':
      return 'Ajuste'
    case 'internal_use':
      return 'Uso interno'
    case 'loss':
      return 'Perda'
    case 'purchase':
      return 'Entrada'
    case 'sale':
      return 'Venda'
    default:
      return type
  }
}

function formatMovementQuantity(quantity: number, unit: string) {
  return `${quantity.toLocaleString('pt-BR', {
    maximumFractionDigits: 0,
  })}${unit ? ` ${unit}` : ''}`
}

function formatMovementDelta(delta: number, unit: string) {
  const sign = delta > 0 ? '+' : ''

  return `${sign}${formatMovementQuantity(delta, unit)}`
}

function formatMovementPrice(movement: StockMovementDTO) {
  const price = movement.unitSalePrice ?? movement.unitCost

  return price === null ? '-' : formatCurrencyBRL(price)
}

function formatMovementNotes(notes: string | null) {
  return notes?.trim() ? notes : '-'
}

function SummaryMetric({
  icon,
  label,
  legend,
  value,
}: {
  icon: ReactNode
  label: string
  legend: string
  value: string
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-zinc-950">{value}</p>
          <p className="mt-1 text-sm text-zinc-500">{legend}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          {icon}
        </div>
      </div>
    </Card>
  )
}

function ReceivedMetric({
  accentClassName,
  icon,
  label,
  value,
}: {
  accentClassName: string
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <Card className="border-stone-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-zinc-500">{label}</p>
          <p className="mt-2 text-lg font-semibold text-zinc-950">{value}</p>
        </div>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accentClassName}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  )
}

function getPendingBadges(product: ProductDTO) {
  return (
    <div className="flex flex-wrap gap-2">
      {isLowStock(product.currentStock, product.minimumStock) ? (
        <Badge className="bg-amber-100 text-amber-800">Estoque baixo</Badge>
      ) : null}
      {product.currentStock === 0 ? (
        <Badge className="bg-red-100 text-red-700">Zerado</Badge>
      ) : null}
      {product.salePriceOpen ? (
        <Badge className="bg-violet-100 text-violet-800">Preco aberto</Badge>
      ) : null}
      {product.averageCost === null ? (
        <Badge className="bg-amber-100 text-amber-800">Custo pendente</Badge>
      ) : null}
      <Badge variant={product.status === 'active' ? 'paid' : 'default'}>
        {product.status === 'active' ? 'Ativo' : 'Inativo'}
      </Badge>
    </div>
  )
}

function ProductActions({
  isMutating,
  onDeactivate,
  onOpenEntry,
  onOpenHistory,
  onOpenMovement,
  onOpenSale,
  onEdit,
  product,
}: {
  isMutating: boolean
  onDeactivate: (product: ProductDTO) => void
  onOpenEntry: (product: ProductDTO) => void
  onOpenHistory: (product: ProductDTO) => void
  onOpenMovement: (product: ProductDTO) => void
  onOpenSale: (product: ProductDTO) => void
  onEdit: (product: ProductDTO) => void
  product: ProductDTO
}) {
  return (
    <div
      aria-label={`Acoes de ${product.name}`}
      className="grid grid-cols-3 justify-items-center gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end"
      role="group"
    >
      <Button
        aria-label={`Editar ${product.name}`}
        className="min-h-11 min-w-11"
        disabled={isMutating}
        icon={<Pencil className="h-4 w-4" aria-hidden="true" />}
        onClick={() => onEdit(product)}
        size="icon"
        title="Editar"
        variant="ghost"
      />
      <Button
        aria-label={`Ver historico de ${product.name}`}
        className="min-h-11 min-w-11"
        disabled={isMutating}
        icon={<History className="h-4 w-4" aria-hidden="true" />}
        onClick={() => onOpenHistory(product)}
        size="icon"
        title="Ver historico"
        variant="ghost"
      />
      {product.status === 'active' ? (
        <>
          <Button
            aria-label={`Registrar entrada para ${product.name}`}
            className="min-h-11 min-w-11"
            disabled={isMutating}
            icon={<ArrowDownToLine className="h-4 w-4" aria-hidden="true" />}
            onClick={() => onOpenEntry(product)}
            size="icon"
            title="Registrar entrada"
            variant="ghost"
          />
          <Button
            aria-label={`Registrar venda de ${product.name}`}
            className="min-h-11 min-w-11"
            disabled={isMutating}
            icon={<ShoppingCart className="h-4 w-4" aria-hidden="true" />}
            onClick={() => onOpenSale(product)}
            size="icon"
            title="Registrar venda"
            variant="ghost"
          />
          <Button
            aria-label={`Registrar movimentacao de ${product.name}`}
            className="min-h-11 min-w-11"
            disabled={isMutating}
            icon={<SlidersHorizontal className="h-4 w-4" aria-hidden="true" />}
            onClick={() => onOpenMovement(product)}
            size="icon"
            title="Registrar movimentacao"
            variant="ghost"
          />
          <Button
            aria-label={`Inativar ${product.name}`}
            className="min-h-11 min-w-11"
            disabled={isMutating}
            icon={<UserX className="h-4 w-4" aria-hidden="true" />}
            onClick={() => onDeactivate(product)}
            size="icon"
            title="Inativar"
            variant="danger"
          />
        </>
      ) : null}
    </div>
  )
}

function getProductFormDefaults(product: ProductDTO) {
  return {
    averageCost: product.averageCost,
    category: product.category ?? '',
    imageUrl: product.imageUrl ?? '',
    internalCode: product.internalCode ?? '',
    minimumStock: product.minimumStock,
    name: product.name,
    notes: product.notes ?? '',
    salePrice: product.salePrice,
    salePriceOpen: product.salePriceOpen,
    size: product.size,
    unit: product.unit,
  }
}

function getStockEntryDefaults(product: ProductDTO) {
  return {
    productId: product.id,
    quantity: 1,
  }
}

function getStockSaleDefaults(product: ProductDTO) {
  return {
    productId: product.id,
    quantity: 1,
  }
}

function getStockMovementDefaults(product: ProductDTO) {
  return {
    adjustmentDelta: -1,
    productId: product.id,
    quantity: 1,
    type: 'internal_use' as const,
  }
}

function getMovementProductOptions(product: ProductDTO) {
  return [{ label: `${product.name} - ${product.size}`, value: product.id }]
}

function ProductRow({
  isMutating,
  onDeactivate,
  onOpenEntry,
  onOpenHistory,
  onOpenMovement,
  onOpenSale,
  onEdit,
  productRevenue,
  productGrossProfit,
  product,
}: {
  isMutating: boolean
  onDeactivate: (product: ProductDTO) => void
  onOpenEntry: (product: ProductDTO) => void
  onOpenHistory: (product: ProductDTO) => void
  onOpenMovement: (product: ProductDTO) => void
  onOpenSale: (product: ProductDTO) => void
  onEdit: (product: ProductDTO) => void
  productRevenue: string
  productGrossProfit: string
  product: ProductDTO
}) {
  return (
    <TableRow>
      <TableCell className="font-medium text-zinc-950">
        <div className="flex min-w-0 items-center gap-3">
          <ProductImageThumbnail
            alt={`Imagem de ${product.name}`}
            fallbackLabel="Sem imagem"
            imageUrl={product.imageUrl}
          />
          <div className="min-w-0">
            <p className="truncate">{product.name}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {product.category?.trim() ? product.category : 'Sem categoria'}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>{product.size}</TableCell>
      <TableCell className="text-base font-semibold text-zinc-950">
        {formatStock(product.currentStock)}
      </TableCell>
      <TableCell>{formatStock(product.minimumStock)}</TableCell>
      <TableCell>
        {product.averageCost === null
          ? 'Pendente'
          : formatCurrencyBRL(product.averageCost)}
      </TableCell>
      <TableCell>{formatSalePrice(product)}</TableCell>
      <TableCell>{formatInventoryValue(product)}</TableCell>
      <TableCell>{productRevenue}</TableCell>
      <TableCell>{productGrossProfit}</TableCell>
      <TableCell>{getPendingBadges(product)}</TableCell>
      <TableCell className="text-right">
        <ProductActions
          isMutating={isMutating}
          onDeactivate={onDeactivate}
          onOpenEntry={onOpenEntry}
          onOpenHistory={onOpenHistory}
          onOpenMovement={onOpenMovement}
          onOpenSale={onOpenSale}
          onEdit={onEdit}
          product={product}
        />
      </TableCell>
    </TableRow>
  )
}

function ProductCard({
  isMutating,
  onDeactivate,
  onOpenEntry,
  onOpenHistory,
  onOpenMovement,
  onOpenSale,
  onEdit,
  productRevenue,
  productGrossProfit,
  product,
}: {
  isMutating: boolean
  onDeactivate: (product: ProductDTO) => void
  onOpenEntry: (product: ProductDTO) => void
  onOpenHistory: (product: ProductDTO) => void
  onOpenMovement: (product: ProductDTO) => void
  onOpenSale: (product: ProductDTO) => void
  onEdit: (product: ProductDTO) => void
  productRevenue: string
  productGrossProfit: string
  product: ProductDTO
}) {
  const inventoryValue = formatInventoryValue(product)

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <ProductImageThumbnail
            alt={`Imagem de ${product.name}`}
            fallbackLabel="Sem imagem"
            imageUrl={product.imageUrl}
          />
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-zinc-950">
              {product.name}
            </h3>
            <p className="mt-1 text-sm text-zinc-600">
              {product.size}
              {product.category?.trim() ? ` - ${product.category}` : ''}
            </p>
          </div>
        </div>
        {product.status === 'inactive' ? (
          <Badge className="bg-stone-100 text-zinc-600">Inativo</Badge>
        ) : (
          <Badge variant="paid">Ativo</Badge>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-zinc-500">Saldo</p>
          <p className="mt-1 text-lg font-semibold text-zinc-950">
            {formatStock(product.currentStock)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-500">Minimo</p>
          <p className="mt-1 text-sm text-zinc-900">
            {formatStock(product.minimumStock)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-500">Custo medio</p>
          <p className="mt-1 text-sm text-zinc-900">
            {product.averageCost === null
              ? 'Pendente'
              : formatCurrencyBRL(product.averageCost)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-500">Preco</p>
          <p className="mt-1 text-sm text-zinc-900">{formatSalePrice(product)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-500">Valor em estoque</p>
          <p className="mt-1 text-sm font-medium text-zinc-950">
            {inventoryValue}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-500">Receita</p>
          <p className="mt-1 text-sm font-medium text-zinc-950">
            {productRevenue}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-500">Lucro bruto</p>
          <p className="mt-1 text-sm font-medium text-zinc-950">
            {productGrossProfit}
          </p>
        </div>
      </div>

      <div className="mt-4">{getPendingBadges(product)}</div>

      <div className="mt-4 flex justify-end">
        <ProductActions
          isMutating={isMutating}
          onDeactivate={onDeactivate}
          onOpenEntry={onOpenEntry}
          onOpenHistory={onOpenHistory}
          onOpenMovement={onOpenMovement}
          onOpenSale={onOpenSale}
          onEdit={onEdit}
          product={product}
        />
      </div>
    </Card>
  )
}

export function ProductsPage({ createRequest }: ProductsPageProps) {
  const queryClient = useQueryClient()
  const previousCreateRequestRef = useRef(createRequest)
  const [filters, setFilters] = useState<ProductPageFilters>(initialFilters)
  const [summaryPeriod, setSummaryPeriod] = useState<ProductSummaryFilters>({})
  const [formMode, setFormMode] = useState<ProductFormMode | null>(null)
  const [movementMode, setMovementMode] = useState<MovementFormMode | null>(null)
  const [historyProduct, setHistoryProduct] = useState<ProductDTO | null>(null)
  const [isExportingCsv, setIsExportingCsv] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [exportErrorMessage, setExportErrorMessage] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<string | undefined>()

  const repositoryFilters = useMemo(
    () => toRepositoryFilters(filters),
    [filters],
  )

  const {
    data: summary,
    error: summaryError,
    isLoading: isLoadingSummary,
  } = useQuery<ProductSummaryDTO>({
    queryKey: ['products', 'summary', summaryPeriod],
    queryFn: () => productRepository.getSummary(summaryPeriod),
  })

  const {
    data: products = [],
    error: productsError,
    isLoading: isLoadingProducts,
  } = useQuery({
    queryKey: ['products', repositoryFilters],
    queryFn: () => productRepository.list(repositoryFilters),
  })

  const createMutation = useMutation({
    mutationFn: (input: ProductFormData) => productRepository.create(input),
    onError: () => {
      setMutationError('Nao foi possivel salvar. Tente novamente.')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      setFeedbackMessage('Produto salvo com sucesso.')
      setFormMode(null)
      setMutationError(undefined)
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => productRepository.deactivate(id),
    onError: () => {
      setFeedbackMessage('Nao foi possivel inativar o produto.')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      setFeedbackMessage('Produto inativado com sucesso.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProductFormData }) =>
      productRepository.update(id, input),
    onError: () => {
      setMutationError('Nao foi possivel salvar. Tente novamente.')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      setFeedbackMessage('Produto atualizado com sucesso.')
      setFormMode(null)
      setMutationError(undefined)
    },
  })

  const movementMutation = useMutation({
    mutationFn: (input: CreateStockMovementInput) =>
      stockMovementRepository.create(input),
    onError: () => {
      setMutationError('Nao foi possivel salvar. Tente novamente.')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const {
    data: productSalesSummaries = [],
    error: productSalesSummaryError,
    isLoading: isLoadingProductSalesSummaries,
  } = useQuery<ProductSalesSummaryDTO[]>({
    queryKey: ['products', 'sales-summary'],
    queryFn: () => productSalesSummaryRepository.getByProduct(),
  })

  const {
    data: productHistory = [],
    error: historyError,
    isLoading: isLoadingHistory,
  } = useQuery({
    enabled: Boolean(historyProduct),
    queryKey: ['products', 'history', historyProduct?.id],
    queryFn: async () => {
      if (!historyProduct) {
        return []
      }

      return stockMovementRepository.listByProductId(historyProduct.id)
    },
  })

  const productSalesSummaryById = useMemo(
    () =>
      new Map(
        productSalesSummaries.map((summary) => [summary.productId, summary]),
      ),
    [productSalesSummaries],
  )

  const categoryOptions = useMemo(
    () => [
      { label: 'Todas as categorias', value: 'all' },
      ...Array.from(
        new Set(
          products
            .map((product) => product.category?.trim())
            .filter((category): category is string => Boolean(category)),
        ),
      )
        .sort((left, right) => left.localeCompare(right, 'pt-BR'))
        .map((category) => ({
          label: category,
          value: category,
        })),
    ],
    [products],
  )

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.lowStock !== 'all' ||
    filters.paymentPending !== 'all' ||
    filters.pendingData !== 'all' ||
    filters.search.trim().length > 0 ||
    filters.status !== 'all'

  useEffect(() => {
    if (
      createRequest !== undefined &&
      createRequest !== previousCreateRequestRef.current
    ) {
      setFormMode({ type: 'create' })
      setMutationError(undefined)
      setFeedbackMessage(null)
    }

    previousCreateRequestRef.current = createRequest
  }, [createRequest])

  function updateFilter<K extends keyof ProductPageFilters>(
    key: K,
    value: ProductPageFilters[K],
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function updateSummaryPeriod<K extends keyof ProductSummaryFilters>(
    key: K,
    value: ProductSummaryFilters[K],
  ) {
    setSummaryPeriod((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function handleResetFilters() {
    setFilters(initialFilters)
  }

  function handleResetSummaryPeriod() {
    setSummaryPeriod({})
  }

  async function handleExportCsv() {
    setExportErrorMessage(null)
    setIsExportingCsv(true)

    try {
      const csv = await productRepository.exportCsv(repositoryFilters)

      downloadFile({
        content: csv,
        filename: 'resumo-produtos.csv',
        mimeType: 'text/csv;charset=utf-8',
      })
    } catch {
      setExportErrorMessage('Nao foi possivel exportar o CSV. Tente novamente.')
    } finally {
      setIsExportingCsv(false)
    }
  }

  function handleCloseCreate() {
    setFormMode(null)
    setMutationError(undefined)
  }

  function handleCloseMovement() {
    setMovementMode(null)
    setMutationError(undefined)
  }

  function handleEditProduct(product: ProductDTO) {
    setFormMode({ product, type: 'edit' })
    setMutationError(undefined)
    setFeedbackMessage(null)
  }

  function handleDeactivateProduct(product: ProductDTO) {
    const confirmed = window.confirm(`Inativar produto ${product.name}?`)

    if (!confirmed) {
      return
    }

    deactivateMutation.mutate(product.id)
  }

  function handleOpenEntry(product: ProductDTO) {
    setMovementMode({ product, type: 'entry' })
    setMutationError(undefined)
    setFeedbackMessage(null)
  }

  function handleOpenSale(product: ProductDTO) {
    setMovementMode({ product, type: 'sale' })
    setMutationError(undefined)
    setFeedbackMessage(null)
  }

  function handleOpenMovement(product: ProductDTO) {
    setMovementMode({ product, type: 'movement' })
    setMutationError(undefined)
    setFeedbackMessage(null)
  }

  function handleOpenHistory(product: ProductDTO) {
    setHistoryProduct(product)
    setMutationError(undefined)
    setFeedbackMessage(null)
  }

  function handleCloseHistory() {
    setHistoryProduct(null)
  }

  async function handleSubmitProduct(input: ProductFormData) {
    if (formMode?.type === 'edit') {
      const previousImageUrl = formMode.product.imageUrl
      const updatedProduct = await updateMutation.mutateAsync({
        id: formMode.product.id,
        input,
      })

      if (
        previousImageUrl &&
        previousImageUrl !== updatedProduct.imageUrl
      ) {
        await deleteProductImageByUrl(previousImageUrl).catch(() => undefined)
      }

      return
    }

    await createMutation.mutateAsync(input)
  }

  async function handleSubmitMovement(input: StockMovementFormData) {
    const currentMode = movementMode
    const movementInput: CreateStockMovementInput = {
      adjustmentDelta: input.adjustmentDelta ?? undefined,
      amountReceived: input.amountReceived ?? 0,
      notes: input.notes ?? null,
      occurredAt: input.occurredAt ?? undefined,
      paymentMethod: input.paymentMethod ?? null,
      productId: input.productId,
      quantity: input.quantity,
      receiptStatus: input.receiptStatus ?? null,
      type: input.type,
      unitCost: input.unitCost ?? null,
      unitSalePrice: input.unitSalePrice ?? null,
    }

    await movementMutation.mutateAsync(movementInput)

    if (!currentMode) {
      return
    }

    if (currentMode.type === 'entry') {
      setFeedbackMessage('Entrada registrada com sucesso.')
    } else if (currentMode.type === 'sale') {
      setFeedbackMessage('Venda registrada com sucesso.')
    } else {
      setFeedbackMessage('Movimentacao registrada com sucesso.')
    }

    setMovementMode(null)
    setMutationError(undefined)
  }

  const isFormSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    movementMutation.isPending
  const isMutating = isFormSubmitting || deactivateMutation.isPending

  const noResultsTitle = hasActiveFilters
    ? 'Nenhum item encontrado para os filtros aplicados.'
    : 'Nenhum produto cadastrado.'

  const selectedHistoryTitle = historyProduct
    ? `Historico de ${historyProduct.name}`
    : 'Historico de produto'
  const hasSummaryPeriod = Boolean(summaryPeriod.dateFrom || summaryPeriod.dateTo)

  function getProductRevenueLabel(productId: string) {
    const revenueValue = productSalesSummaryById.get(productId)?.revenueValue

    return formatProductRevenue(
      revenueValue,
      isLoadingProductSalesSummaries,
      Boolean(productSalesSummaryError),
    )
  }

  function getProductGrossProfitLabel(productId: string) {
    const grossProfitValue =
      productSalesSummaryById.get(productId)?.grossProfitValue

    return formatProductGrossProfit(
      grossProfitValue,
      isLoadingProductSalesSummaries,
      Boolean(productSalesSummaryError),
    )
  }

  function formatReceivedTotal(value: number) {
    return formatCurrencyBRL(value)
  }

  return (
    <div className="space-y-4">
      {feedbackMessage ? (
        <Card className="border-emerald-200 bg-emerald-50 p-4" role="status">
          <p className="text-sm font-medium text-emerald-800">
            {feedbackMessage}
          </p>
        </Card>
      ) : null}

      {exportErrorMessage ? (
        <ErrorState description={exportErrorMessage} title="Falha na exportacao." variant="inline" />
      ) : null}

      {summaryError ? (
        <ErrorState title="Nao foi possivel carregar o resumo de produtos." />
      ) : null}

      <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,180px)_minmax(0,180px)_auto] lg:items-end">
          <Input
            className="text-base sm:text-sm"
            label="Periodo inicial"
            name="summaryDateFrom"
            onChange={(event) =>
              updateSummaryPeriod('dateFrom', event.target.value || undefined)
            }
            type="date"
            value={summaryPeriod.dateFrom ?? ''}
          />
          <Input
            className="text-base sm:text-sm"
            label="Periodo final"
            name="summaryDateTo"
            onChange={(event) =>
              updateSummaryPeriod('dateTo', event.target.value || undefined)
            }
            type="date"
            value={summaryPeriod.dateTo ?? ''}
          />
          <div className="flex justify-start lg:justify-end">
            <Button
              disabled={!hasSummaryPeriod}
              icon={<FilterX className="h-4 w-4" aria-hidden="true" />}
              onClick={handleResetSummaryPeriod}
              className="min-h-11 w-full sm:w-auto"
              variant="secondary"
            >
              Limpar periodo
            </Button>
          </div>
        </div>
        {hasSummaryPeriod ? (
          <p className="mt-3 text-sm text-zinc-500">
            Resumo filtrado de {summaryPeriod.dateFrom ? formatPeriodLabel(summaryPeriod.dateFrom) : 'inicio'}{' '}
            até {summaryPeriod.dateTo ? formatPeriodLabel(summaryPeriod.dateTo) : 'hoje'}.
          </p>
        ) : null}
      </section>

      {isLoadingSummary ? (
        <LoadingState
          label="Carregando resumo de produtos..."
          variant="cards"
        />
      ) : null}

      {!isLoadingSummary && !summaryError && summary ? (
        <section className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
          <SummaryMetric
            icon={<Package className="h-5 w-5" aria-hidden="true" />}
            label="Produtos ativos"
            legend="Cadastro ativo no sistema"
            value={summary.activeProductsCount.toLocaleString('pt-BR')}
          />
          <SummaryMetric
            icon={<PackageX className="h-5 w-5" aria-hidden="true" />}
            label="Estoque baixo"
            legend="Itens abaixo do minimo"
            value={summary.lowStockCount.toLocaleString('pt-BR')}
          />
          <SummaryMetric
            icon={<CircleDollarSign className="h-5 w-5" aria-hidden="true" />}
            label="Valor em estoque"
            legend="Saldo valorizado pelo custo medio"
            value={formatCurrencyBRL(summary.inventoryValue)}
          />
          <SummaryMetric
            icon={<TrendingUp className="h-5 w-5" aria-hidden="true" />}
            label="Receita"
            legend="Total acumulado das vendas"
            value={formatCurrencyBRL(summary.periodRevenue)}
          />
          <SummaryMetric
            icon={<TrendingDown className="h-5 w-5" aria-hidden="true" />}
            label="Lucro bruto"
            legend="Resultado bruto acumulado"
            value={formatCurrencyBRL(summary.periodGrossProfit)}
          />
          <SummaryMetric
            icon={<HandCoins className="h-5 w-5" aria-hidden="true" />}
            label="Recebido"
            legend="Total de valores recebidos"
            value={formatCurrencyBRL(summary.periodReceived)}
          />
        </section>
      ) : null}

      {!isLoadingSummary && !summaryError && summary ? (
        <section aria-label="Resumo de recebimento">
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
            <ReceivedMetric
              accentClassName="bg-emerald-50 text-emerald-700"
              icon={<HandCoins className="h-4 w-4" aria-hidden="true" />}
              label="Pix"
              value={formatReceivedTotal(summary.receivedByPaymentMethod.pix)}
            />
            <ReceivedMetric
              accentClassName="bg-blue-50 text-blue-700"
              icon={<CreditCard className="h-4 w-4" aria-hidden="true" />}
              label="Cartao"
              value={formatReceivedTotal(summary.receivedByPaymentMethod.card)}
            />
            <ReceivedMetric
              accentClassName="bg-stone-100 text-zinc-700"
              icon={<Banknote className="h-4 w-4" aria-hidden="true" />}
              label="Dinheiro"
              value={formatReceivedTotal(summary.receivedByPaymentMethod.cash)}
            />
            <ReceivedMetric
              accentClassName="bg-emerald-50 text-emerald-700"
              icon={<HandCoins className="h-4 w-4" aria-hidden="true" />}
              label="Total recebido"
              value={formatReceivedTotal(summary.periodReceived)}
            />
          </div>
        </section>
      ) : null}

      <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_180px] xl:grid-cols-[minmax(0,1fr)_180px_180px_180px_180px_180px]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              aria-hidden="true"
            />
            <Input
              aria-label="Buscar produto ou tamanho"
              className="min-h-11 pl-9 text-base sm:text-sm"
              name="productSearch"
              onChange={(event) => updateFilter('search', event.target.value)}
              placeholder="Buscar produto ou tamanho"
              type="search"
              value={filters.search}
            />
          </div>

          <Select
            aria-label="Filtrar por categoria"
            className="min-h-11 text-base sm:text-sm"
            name="categoryFilter"
            onChange={(event) => updateFilter('category', event.target.value)}
            options={categoryOptions}
            value={filters.category}
          />

          <Select
            aria-label="Filtrar por status"
            className="min-h-11 text-base sm:text-sm"
            name="statusFilter"
            onChange={(event) =>
              updateFilter('status', event.target.value as StatusFilter)
            }
            options={[
              { label: 'Todos os status', value: 'all' },
              { label: 'Ativos', value: 'active' },
              { label: 'Inativos', value: 'inactive' },
            ]}
            value={filters.status}
          />

          <Select
            aria-label="Filtrar por estoque baixo"
            className="min-h-11 text-base sm:text-sm"
            name="lowStockFilter"
            onChange={(event) =>
              updateFilter('lowStock', event.target.value as ToggleFilter)
            }
            options={[
              { label: 'Todos os estoques', value: 'all' },
              { label: 'Somente baixo estoque', value: 'yes' },
            ]}
            value={filters.lowStock}
          />

          <Select
            aria-label="Filtrar por dados pendentes"
            className="min-h-11 text-base sm:text-sm"
            name="pendingDataFilter"
            onChange={(event) =>
              updateFilter('pendingData', event.target.value as ToggleFilter)
            }
            options={[
              { label: 'Todos os dados', value: 'all' },
              { label: 'Somente pendentes', value: 'yes' },
            ]}
            value={filters.pendingData}
          />

          <Select
            aria-label="Filtrar por pagamento pendente"
            className="min-h-11 text-base sm:text-sm"
            name="paymentPendingFilter"
            onChange={(event) =>
              updateFilter('paymentPending', event.target.value as ToggleFilter)
            }
            options={[
              { label: 'Todos os pagamentos', value: 'all' },
              { label: 'Pagamento pendente (fiado)', value: 'yes' },
            ]}
            value={filters.paymentPending}
          />
        </div>

      <div className="mt-4 flex flex-wrap justify-end gap-3">
        <Button
          disabled={isExportingCsv}
          className="min-h-11 w-full sm:w-auto"
          icon={<Download className="h-4 w-4" aria-hidden="true" />}
          onClick={handleExportCsv}
          variant="secondary"
        >
          {isExportingCsv ? 'Exportando...' : 'Exportar CSV'}
        </Button>
        <Button
          disabled={!hasActiveFilters}
          className="min-h-11 w-full sm:w-auto"
          icon={<FilterX className="h-4 w-4" aria-hidden="true" />}
          onClick={handleResetFilters}
          variant="secondary"
        >
          Limpar filtros
        </Button>
        </div>
      </section>

      {productsError ? (
        <ErrorState title="Nao foi possivel carregar os produtos." />
      ) : null}

      {productSalesSummaryError ? (
        <ErrorState
          description="A receita por produto sera exibida assim que os dados puderem ser carregados novamente."
          title="Nao foi possivel carregar a receita por produto."
          variant="inline"
        />
      ) : null}

      {isLoadingProducts ? (
        <>
          <div className="hidden lg:block">
            <LoadingState
              label="Carregando produtos..."
              rows={6}
              variant="table"
            />
          </div>
          <div className="lg:hidden">
            <LoadingState
              label="Carregando produtos..."
              rows={4}
              variant="list"
            />
          </div>
        </>
      ) : null}

      {!isLoadingProducts && !productsError && products.length === 0 ? (
        <EmptyState
          action={
            hasActiveFilters ? (
              <Button
                icon={<FilterX className="h-4 w-4" aria-hidden="true" />}
                onClick={handleResetFilters}
                variant="secondary"
              >
                Limpar filtros
              </Button>
            ) : null
          }
          description={
            hasActiveFilters
              ? 'Tente ajustar a busca ou remover os filtros aplicados.'
              : undefined
          }
          title={noResultsTitle}
        />
      ) : null}

      {!isLoadingProducts && !productsError && products.length > 0 ? (
        <>
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Minimo</TableHead>
                  <TableHead>Custo</TableHead>
                  <TableHead>Preco</TableHead>
                  <TableHead>Valor estoque</TableHead>
                  <TableHead>Receita</TableHead>
                  <TableHead>Lucro bruto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <ProductRow
                    key={product.id}
                    isMutating={isMutating}
                    onDeactivate={handleDeactivateProduct}
                    onOpenEntry={handleOpenEntry}
                    onOpenHistory={handleOpenHistory}
                    onOpenMovement={handleOpenMovement}
                    onOpenSale={handleOpenSale}
                    onEdit={handleEditProduct}
                    productRevenue={getProductRevenueLabel(product.id)}
                    productGrossProfit={getProductGrossProfitLabel(product.id)}
                    product={product}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 lg:hidden">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                isMutating={isMutating}
                onDeactivate={handleDeactivateProduct}
                onOpenEntry={handleOpenEntry}
                onOpenHistory={handleOpenHistory}
                onOpenMovement={handleOpenMovement}
                onOpenSale={handleOpenSale}
                onEdit={handleEditProduct}
                productRevenue={getProductRevenueLabel(product.id)}
                productGrossProfit={getProductGrossProfitLabel(product.id)}
                product={product}
              />
            ))}
          </div>
        </>
      ) : null}

      <Modal
        isOpen={Boolean(formMode)}
        onClose={handleCloseCreate}
        title={formMode?.type === 'edit' ? 'Editar produto' : 'Novo produto'}
      >
        <ProductForm
          key={formMode?.type === 'edit' ? formMode.product.id : 'create'}
          defaultValues={
            formMode?.type === 'edit'
              ? getProductFormDefaults(formMode.product)
              : undefined
          }
          errorMessage={mutationError}
          isSubmitting={isFormSubmitting}
          onCancel={handleCloseCreate}
          onSubmit={handleSubmitProduct}
          submitLabel={
            formMode?.type === 'edit' ? 'Salvar alteracoes' : 'Criar produto'
          }
        />
      </Modal>

      <Modal
        isOpen={Boolean(movementMode)}
        onClose={handleCloseMovement}
        title={
          movementMode?.type === 'entry'
            ? 'Registrar entrada'
            : movementMode?.type === 'sale'
              ? 'Registrar venda'
              : 'Registrar movimentacao'
        }
      >
        {movementMode?.type === 'entry' ? (
          <StockEntryForm
            key={`${movementMode.product.id}-entry`}
            defaultValues={getStockEntryDefaults(movementMode.product)}
            errorMessage={mutationError}
            isSubmitting={movementMutation.isPending}
            onCancel={handleCloseMovement}
            onSubmit={handleSubmitMovement}
            productOptions={getMovementProductOptions(movementMode.product)}
            productStatus={movementMode.product.status}
            submitLabel="Registrar entrada"
            averageCost={movementMode.product.averageCost}
            currentStock={movementMode.product.currentStock}
          />
        ) : null}

        {movementMode?.type === 'sale' ? (
          <StockSaleForm
            key={`${movementMode.product.id}-sale`}
            defaultValues={getStockSaleDefaults(movementMode.product)}
            errorMessage={mutationError}
            isSubmitting={movementMutation.isPending}
            onCancel={handleCloseMovement}
            onSubmit={handleSubmitMovement}
            productOptions={getMovementProductOptions(movementMode.product)}
            productStatus={movementMode.product.status}
            submitLabel="Registrar venda"
            averageCost={movementMode.product.averageCost}
            currentStock={movementMode.product.currentStock}
          />
        ) : null}

        {movementMode?.type === 'movement' ? (
          <StockMovementForm
            key={`${movementMode.product.id}-movement`}
            defaultValues={getStockMovementDefaults(movementMode.product)}
            errorMessage={mutationError}
            isSubmitting={movementMutation.isPending}
            onCancel={handleCloseMovement}
            onSubmit={handleSubmitMovement}
            productOptions={getMovementProductOptions(movementMode.product)}
            productStatus={movementMode.product.status}
            submitLabel="Registrar movimentacao"
            averageCost={movementMode.product.averageCost}
            currentStock={movementMode.product.currentStock}
          />
        ) : null}
      </Modal>

      <Modal
        className="sm:max-w-5xl"
        isOpen={Boolean(historyProduct)}
        onClose={handleCloseHistory}
        title={selectedHistoryTitle}
      >
        {historyProduct ? (
          <div className="space-y-4">
            {historyError ? (
              <ErrorState
                description="Nao foi possivel carregar o historico deste produto."
                title="Nao foi possivel carregar o historico."
                variant="inline"
              />
            ) : null}

            {isLoadingHistory ? (
              <>
                <div className="hidden lg:block">
                  <LoadingState
                    label="Carregando historico do produto..."
                    rows={5}
                    variant="table"
                  />
                </div>
                <div className="lg:hidden">
                  <LoadingState
                    label="Carregando historico do produto..."
                    rows={4}
                    variant="list"
                  />
                </div>
              </>
            ) : null}

            {!isLoadingHistory && !historyError && productHistory.length === 0 ? (
              <EmptyState
                description="Nao ha movimentacoes registradas para este produto."
                title="Historico vazio."
                variant="inline"
              />
            ) : null}

            {!isLoadingHistory && !historyError && productHistory.length > 0 ? (
              <>
                <div className="hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Saldo alterado</TableHead>
                        <TableHead>Preco</TableHead>
                        <TableHead>Receita</TableHead>
                        <TableHead>Recebido</TableHead>
                        <TableHead>Lucro</TableHead>
                        <TableHead>Observacao</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productHistory.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell className="whitespace-nowrap">
                            {formatMovementDate(movement.occurredAt)}
                          </TableCell>
                          <TableCell>{formatMovementType(movement.type)}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatMovementQuantity(movement.quantity, historyProduct.unit)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatMovementDelta(movement.stockDelta, historyProduct.unit)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatMovementPrice(movement)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatCurrencyBRL(movement.revenueValue)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatCurrencyBRL(movement.amountReceived)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatCurrencyBRL(movement.grossProfitValue)}
                          </TableCell>
                          <TableCell className="max-w-64">
                            <span className="block truncate">
                              {formatMovementNotes(movement.notes)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid gap-3 lg:hidden">
                  {productHistory.map((movement) => (
                    <Card className="p-4" key={movement.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-950">
                            {formatMovementType(movement.type)}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {formatMovementDate(movement.occurredAt)}
                          </p>
                        </div>
                        <Badge className="bg-stone-100 text-zinc-700">
                          {formatMovementDelta(movement.stockDelta, historyProduct.unit)}
                        </Badge>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-medium text-zinc-500">Quantidade</p>
                          <p className="mt-1 text-sm text-zinc-900">
                            {formatMovementQuantity(movement.quantity, historyProduct.unit)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-zinc-500">Preco</p>
                          <p className="mt-1 text-sm text-zinc-900">
                            {formatMovementPrice(movement)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-zinc-500">Receita</p>
                          <p className="mt-1 text-sm text-zinc-900">
                            {formatCurrencyBRL(movement.revenueValue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-zinc-500">Recebido</p>
                          <p className="mt-1 text-sm text-zinc-900">
                            {formatCurrencyBRL(movement.amountReceived)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-zinc-500">Lucro</p>
                          <p className="mt-1 text-sm text-zinc-900">
                            {formatCurrencyBRL(movement.grossProfitValue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-zinc-500">Observacao</p>
                          <p className="mt-1 text-sm text-zinc-900">
                            {formatMovementNotes(movement.notes)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
