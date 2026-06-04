import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Card } from './Card'

type EmptyStateProps = {
  action?: ReactNode
  className?: string
  description?: string
  icon?: ReactNode
  title: string
  variant?: 'card' | 'inline'
}

export function EmptyState({
  action,
  className,
  description,
  icon,
  title,
  variant = 'card',
}: EmptyStateProps) {
  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        variant === 'card' ? 'min-h-40 p-6' : 'py-6',
        className,
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-stone-100 text-zinc-500">
        {icon ?? <Inbox className="h-5 w-5" aria-hidden="true" />}
      </div>
      <h3 className="mt-4 text-sm font-semibold text-zinc-950">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-md text-sm text-zinc-600">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )

  if (variant === 'inline') {
    return content
  }

  return <Card>{content}</Card>
}
