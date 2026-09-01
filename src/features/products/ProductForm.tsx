import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { cn } from '../../utils/cn'
import {
  deleteProductImageByUrl,
  uploadProductImage,
  validateProductImageFile,
} from '../../services/storage/productImageStorage'
import { ProductImagePreview } from './ProductImage'
import {
  productSchema,
  type ProductFormData,
  type ProductFormInput,
} from './product.schema'

type ProductFormProps = {
  defaultValues?: Partial<ProductFormData>
  errorMessage?: string
  isSubmitting?: boolean
  onCancel?: () => void
  onSubmit: (input: ProductFormData) => Promise<void> | void
  submitLabel?: string
}

function ProductFieldsetTitle({
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

export function ProductForm({
  defaultValues,
  errorMessage,
  isSubmitting = false,
  onCancel,
  onSubmit,
  submitLabel = 'Salvar produto',
}: ProductFormProps) {
  const {
    control,
    formState: { errors, isSubmitting: isFormSubmitting },
    handleSubmit,
    register,
  } = useForm<ProductFormInput, unknown, ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      averageCost: defaultValues?.averageCost ?? '',
      category: defaultValues?.category ?? '',
      imageUrl: defaultValues?.imageUrl ?? '',
      internalCode: defaultValues?.internalCode ?? '',
      minimumStock: defaultValues?.minimumStock ?? 0,
      name: defaultValues?.name ?? '',
      notes: defaultValues?.notes ?? '',
      salePrice: defaultValues?.salePrice ?? '',
      salePriceOpen: defaultValues?.salePriceOpen ?? true,
      size: defaultValues?.size ?? '',
      unit: defaultValues?.unit ?? 'un',
    },
  })

  const disabled = isSubmitting || isFormSubmitting
  const productName = useWatch({
    control,
    name: 'name',
  })
  const salePriceOpen = useWatch({
    control,
    name: 'salePriceOpen',
  })
  const initialImageUrl = defaultValues?.imageUrl?.trim() || null
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    initialImageUrl,
  )
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [removedImage, setRemovedImage] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  useEffect(() => {
    return () => {
      if (imagePreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])

  function handleBrowseImage() {
    fileInputRef.current?.click()
  }

  function handleRemoveImage() {
    setImageError(null)
    setSelectedImageFile(null)
    setRemovedImage(true)

    if (imagePreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl)
    }

    setImagePreviewUrl(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null

    setImageError(null)

    if (!file) {
      return
    }

    const validationError = validateProductImageFile(file)

    if (validationError) {
      setImageError(validationError)
      event.target.value = ''
      return
    }

    if (imagePreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl)
    }

    setSelectedImageFile(file)
    setRemovedImage(false)
    setImagePreviewUrl(URL.createObjectURL(file))
  }

  async function handleFormSubmit(input: ProductFormData) {
    setImageError(null)
    setIsUploadingImage(true)

    let uploadedImageUrl: string | null = null
    let resolvedImageUrl = removedImage ? null : input.imageUrl ?? null

    try {
      if (selectedImageFile) {
        const uploadedImage = await uploadProductImage(selectedImageFile)
        uploadedImageUrl = uploadedImage.imageUrl
        resolvedImageUrl = uploadedImage.imageUrl
      }

      await onSubmit({
        ...input,
        imageUrl: resolvedImageUrl,
      })
    } catch (error) {
      if (uploadedImageUrl) {
        await deleteProductImageByUrl(uploadedImageUrl).catch(() => undefined)
      }

      if (error instanceof Error && !selectedImageFile) {
        throw error
      }

      if (selectedImageFile && !uploadedImageUrl) {
        setImageError(error instanceof Error ? error.message : 'Nao foi possivel enviar a imagem.')
        return
      }

      if (selectedImageFile && uploadedImageUrl) {
        throw error
      }
    } finally {
      setIsUploadingImage(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
      {errorMessage ? (
        <p
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      {imageError ? (
        <p
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {imageError}
        </p>
      ) : null}

      <section className="space-y-4">
        <ProductFieldsetTitle
          description="Dados que identificam a variacao do produto."
          title="Identificacao"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            autoComplete="off"
            disabled={disabled}
            error={errors.name?.message}
            label="Nome"
            placeholder="Ex: Lavanda"
            {...register('name')}
          />

          <Input
            autoComplete="off"
            disabled={disabled}
            error={errors.size?.message}
            label="Tamanho"
            placeholder="Ex: 5ml"
            {...register('size')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            autoComplete="off"
            className="sm:col-span-2"
            disabled={disabled}
            error={errors.internalCode?.message}
            label="Codigo interno"
            placeholder="Ex: PROD-001"
            {...register('internalCode')}
          />
        </div>

        <Input
          autoComplete="off"
          disabled={disabled}
          error={errors.category?.message}
          label="Categoria"
          placeholder="Ex: Oleos"
          {...register('category')}
        />

        <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <ProductImagePreview
              alt={
                productName?.trim()
                  ? `Imagem de ${productName.trim()}`
                  : 'Preview da imagem do produto'
              }
              className="sm:h-40 sm:w-40 sm:shrink-0"
              fallbackLabel="Sem imagem"
              imageUrl={imagePreviewUrl}
            />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-zinc-950">Imagem do produto</p>
                <p className="text-sm text-zinc-500">
                  PNG, JPG ou WEBP, com limite de 5 MB. A imagem e opcional.
                </p>
              </div>

              <input
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/webp"
                aria-label="Selecionar imagem do produto"
                className="sr-only"
                disabled={disabled || isUploadingImage}
                id="product-image-input"
                type="file"
                onChange={handleImageChange}
              />

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="min-h-11"
                  disabled={disabled || isUploadingImage}
                  icon={<Upload className="h-4 w-4" aria-hidden="true" />}
                  onClick={handleBrowseImage}
                  type="button"
                  variant="secondary"
                >
                  {selectedImageFile ? 'Trocar imagem' : 'Selecionar imagem'}
                </Button>
                <Button
                  className="min-h-11"
                  disabled={disabled || isUploadingImage || (!imagePreviewUrl && !initialImageUrl)}
                  icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
                  onClick={handleRemoveImage}
                  type="button"
                  variant="ghost"
                >
                  Remover imagem
                </Button>
              </div>

              <p className="text-xs text-zinc-500">
                O cadastro continua valido sem imagem. O preview local aparece
                imediatamente antes de salvar.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <ProductFieldsetTitle
          description="Controle de saldo e estoque minimo."
          title="Estoque"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            disabled={disabled}
            error={errors.unit?.message}
            label="Unidade"
            placeholder="Ex: un"
            {...register('unit')}
          />

          <Input
            disabled={disabled}
            error={errors.minimumStock?.message}
            label="Estoque minimo"
            min={0}
            step="1"
            type="number"
            {...register('minimumStock')}
          />
        </div>

        <p className="text-sm text-zinc-500">
          O estoque inicial deve ser registrado depois por Registrar entrada.
        </p>
      </section>

      <section className="space-y-4">
        <ProductFieldsetTitle
          description="Preco de venda e custo medio para operacao diaria."
          title="Valores"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            disabled={disabled}
            error={errors.averageCost?.message}
            label="Custo medio"
            min={0}
            placeholder="0,00"
            step="0.01"
            type="number"
            {...register('averageCost')}
          />

          <Input
            disabled={disabled || salePriceOpen}
            error={errors.salePrice?.message}
            label="Preco de venda"
            min={0}
            placeholder={salePriceOpen ? 'Aberto' : '0,00'}
            step="0.01"
            type="number"
            {...register('salePrice')}
          />
        </div>

        <label className="flex min-h-11 items-center gap-3 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900">
          <input
            className="h-4 w-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-700"
            disabled={disabled}
            aria-describedby="sale-price-open-help"
            type="checkbox"
            {...register('salePriceOpen')}
          />
          Preco aberto
        </label>

        <p
          id="sale-price-open-help"
          className={cn(
            'text-sm',
            salePriceOpen ? 'text-amber-700' : 'text-zinc-500',
          )}
        >
          {salePriceOpen
            ? 'Produto com preco aberto precisa de valor definido na venda.'
            : 'Informe preco de venda maior que zero para finalizar o cadastro.'}
        </p>
      </section>

      <section className="space-y-4">
        <ProductFieldsetTitle
          description="Informacoes complementares do cadastro."
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
            placeholder="Observacoes do produto"
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
          {isUploadingImage ? 'Enviando imagem...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
