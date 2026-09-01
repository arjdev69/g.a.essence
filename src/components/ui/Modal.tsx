import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Button } from './Button'

type ModalProps = {
  children: ReactNode
  isOpen: boolean
  title: string
  onClose: () => void
  footer?: ReactNode
  className?: string
}

export function Modal({
  children,
  className,
  footer,
  isOpen,
  onClose,
  title,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 p-0 sm:items-center sm:p-4"
      role="dialog"
    >
      <div
        className={cn(
          'max-h-[100dvh] w-full overflow-auto rounded-t-lg border border-stone-200 bg-white shadow-xl sm:max-h-[92vh] sm:max-w-3xl sm:rounded-lg',
          className,
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-stone-200 px-4 py-3 sm:px-5 sm:py-4">
          <h2 className="min-w-0 truncate text-lg font-semibold text-zinc-950">{title}</h2>
          <Button
            aria-label="Fechar"
            className="min-h-11 min-w-11"
            icon={<X className="h-4 w-4" aria-hidden="true" />}
            onClick={onClose}
            size="icon"
            variant="ghost"
          />
        </div>
        <div className="p-4 sm:p-5">{children}</div>
        {footer ? (
          <div className="border-t border-stone-200 px-5 py-4">{footer}</div>
        ) : null}
      </div>
    </div>
  )
}
