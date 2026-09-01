import { ImageOff, Package } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../utils/cn'

type ProductImageSize = 'sm' | 'md' | 'lg'

type ProductImageProps = {
  alt: string
  className?: string
  fallbackLabel?: string
  imageUrl?: string | null
  size?: ProductImageSize
}

const sizeClasses: Record<ProductImageSize, string> = {
  lg: 'h-40 w-full',
  md: 'h-16 w-16',
  sm: 'h-12 w-12',
}

function FallbackProductImage({
  className,
  fallbackLabel = 'Sem imagem',
  size = 'md',
}: Pick<ProductImageProps, 'className' | 'fallbackLabel' | 'size'>) {
  return (
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden rounded-lg border border-dashed border-stone-300 bg-stone-100 text-zinc-500',
        sizeClasses[size],
        className,
      )}
    >
      <div className="flex flex-col items-center gap-1 px-2 text-center">
        <Package className="h-5 w-5" aria-hidden="true" />
        <span className="text-[11px] font-medium leading-tight">
          {fallbackLabel}
        </span>
      </div>
    </div>
  )
}

export function ProductImage({
  alt,
  className,
  fallbackLabel,
  imageUrl,
  size = 'md',
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false)

  if (!imageUrl || hasError) {
    return (
      <FallbackProductImage
        className={className}
        fallbackLabel={fallbackLabel}
        size={size}
      />
    )
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-stone-200 bg-stone-50',
        sizeClasses[size],
        className,
      )}
    >
      <img
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
        src={imageUrl}
        onError={() => setHasError(true)}
      />
      <span className="sr-only">{alt}</span>
    </div>
  )
}

export function ProductImagePreview({
  alt,
  className,
  fallbackLabel,
  imageUrl,
}: Omit<ProductImageProps, 'size'>) {
  return (
    <ProductImage
      key={imageUrl ?? 'empty'}
      alt={alt}
      className={className}
      fallbackLabel={fallbackLabel}
      imageUrl={imageUrl}
      size="lg"
    />
  )
}

export function ProductImageMini({
  alt,
  className,
  fallbackLabel,
  imageUrl,
}: Omit<ProductImageProps, 'size'>) {
  return (
    <ProductImage
      key={imageUrl ?? 'empty'}
      alt={alt}
      className={className}
      fallbackLabel={fallbackLabel}
      imageUrl={imageUrl}
      size="sm"
    />
  )
}

export function ProductImageThumbnail({
  alt,
  className,
  fallbackLabel,
  imageUrl,
}: Omit<ProductImageProps, 'size'>) {
  return (
    <ProductImage
      key={imageUrl ?? 'empty'}
      alt={alt}
      className={className}
      fallbackLabel={fallbackLabel}
      imageUrl={imageUrl}
      size="md"
    />
  )
}

export function ProductImagePlaceholderIcon() {
  return <ImageOff className="h-5 w-5" aria-hidden="true" />
}
