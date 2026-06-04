import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type BadgeVariant =
  | 'default'
  | 'scheduled'
  | 'completed'
  | 'paid'
  | 'cancelled'
  | 'no_show'
  | 'gift'

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-stone-100 text-zinc-700',
  scheduled: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  paid: 'bg-emerald-50 text-emerald-800',
  cancelled: 'bg-red-50 text-red-700',
  no_show: 'bg-amber-50 text-amber-700',
  gift: 'bg-violet-50 text-violet-700',
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-6 items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}
