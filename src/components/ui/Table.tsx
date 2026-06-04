import type { HTMLAttributes, TableHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export function Table({
  className,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
      <table
        className={cn('min-w-full text-left text-sm', className)}
        {...props}
      />
    </div>
  )
}

export function TableHeader({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-white', className)} {...props} />
}

export function TableBody({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-stone-200', className)} {...props} />
}

export function TableRow({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b border-stone-200 last:border-b-0', className)} {...props} />
}

export function TableHead({
  className,
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn('px-4 py-3 text-sm font-semibold text-zinc-950', className)}
      {...props}
    />
  )
}

export function TableCell({
  className,
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3 text-sm text-zinc-900', className)} {...props} />
}
