import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Card } from './Card'

type ErrorStateProps = {
  action?: ReactNode
  className?: string
  description?: string
  title?: string
  variant?: 'card' | 'inline'
}

export function ErrorState({
  action,
  className,
  description = 'Tente novamente em alguns instantes.',
  title = 'Nao foi possivel carregar os dados.',
  variant = 'card',
}: ErrorStateProps) {
  const body = (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-red-800">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-red-700">{description}</p>
        ) : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </>
  )

  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex items-start gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-left',
          className,
        )}
        role="alert"
      >
        {body}
      </div>
    )
  }

  return (
    <Card
      className={cn(
        'flex items-start gap-3 border-red-200 bg-red-50 p-5 text-left',
        className,
      )}
      role="alert"
    >
      {body}
    </Card>
  )
}
