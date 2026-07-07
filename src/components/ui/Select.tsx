import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type SelectOption = {
  label: string
  value: string
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  options?: SelectOption[]
}

export function Select({
  children,
  className,
  error,
  id,
  label,
  options,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name
  const errorId = error && selectId ? `${selectId}-error` : undefined
  const {
    ['aria-describedby']: ariaDescribedBy,
    ...restProps
  } =
    props as SelectHTMLAttributes<HTMLSelectElement> & {
      'aria-describedby'?: string
    }
  const describedBy = [ariaDescribedBy, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="space-y-2">
      {label && selectId ? (
        <label className="block text-sm font-medium text-zinc-900" htmlFor={selectId}>
          {label}
        </label>
      ) : null}
      <select
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={cn(
          'h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-zinc-500',
          error && 'border-red-500 focus:border-red-600 focus:ring-red-600/20',
          className,
        )}
        id={selectId}
        {...restProps}
      >
        {options
          ? options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          : children}
      </select>
      {error ? (
        <p className="text-sm text-red-700" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
