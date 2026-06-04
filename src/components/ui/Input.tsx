import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export function Input({ className, error, id, label, ...props }: InputProps) {
  const inputId = id ?? props.name
  const errorId = error && inputId ? `${inputId}-error` : undefined

  return (
    <div className="space-y-2">
      {label && inputId ? (
        <label className="block text-sm font-medium text-zinc-900" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className={cn(
          'h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-zinc-500',
          error && 'border-red-500 focus:border-red-600 focus:ring-red-600/20',
          className,
        )}
        id={inputId}
        {...props}
      />
      {error ? (
        <p className="text-sm text-red-700" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
