import { cn } from '../../utils/cn'
import { Card } from './Card'

type LoadingStateVariant = 'cards' | 'form' | 'list' | 'table'

type LoadingStateProps = {
  label?: string
  rows?: number
  variant?: LoadingStateVariant
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-stone-200', className)}
      aria-hidden="true"
    />
  )
}

function LoadingCards({ rows }: { rows: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: rows }, (_, index) => (
        <Card className="p-5" key={index}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-7 w-32" />
            </div>
            <SkeletonBlock className="h-10 w-10 rounded-lg" />
          </div>
        </Card>
      ))}
    </div>
  )
}

function LoadingList({ rows }: { rows: number }) {
  return (
    <Card className="p-5">
      <div className="space-y-4">
        {Array.from({ length: rows }, (_, index) => (
          <div className="grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)_120px]" key={index}>
            <SkeletonBlock className="h-5 w-24" />
            <SkeletonBlock className="h-5 w-full" />
            <SkeletonBlock className="h-5 w-20 sm:justify-self-end" />
          </div>
        ))}
      </div>
    </Card>
  )
}

function LoadingTable({ rows }: { rows: number }) {
  return (
    <Card className="p-5">
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <div className="grid gap-3 md:grid-cols-4" key={index}>
            <SkeletonBlock className="h-5 w-full" />
            <SkeletonBlock className="h-5 w-full" />
            <SkeletonBlock className="h-5 w-full" />
            <SkeletonBlock className="h-5 w-20 md:justify-self-end" />
          </div>
        ))}
      </div>
    </Card>
  )
}

function LoadingForm({ rows }: { rows: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }, (_, index) => (
        <div className="space-y-2" key={index}>
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-10 w-full" />
        </div>
      ))}
    </div>
  )
}

export function LoadingState({
  label = 'Carregando...',
  rows,
  variant = 'list',
}: LoadingStateProps) {
  const rowCount = rows ?? (variant === 'cards' ? 4 : 3)

  return (
    <div aria-busy="true" aria-label={label} role="status">
      <span className="sr-only">{label}</span>
      {variant === 'cards' ? <LoadingCards rows={rowCount} /> : null}
      {variant === 'form' ? <LoadingForm rows={rowCount} /> : null}
      {variant === 'list' ? <LoadingList rows={rowCount} /> : null}
      {variant === 'table' ? <LoadingTable rows={rowCount} /> : null}
    </div>
  )
}
