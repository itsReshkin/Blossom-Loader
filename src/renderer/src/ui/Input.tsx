import { InputHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from '@renderer/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, id, className, required, ...rest },
  ref
) {
  const autoId = useId()
  const inputId = id ?? autoId

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-(--color-text)">
          {label}
          {required && <span className="ml-1 text-(--color-danger)">*</span>}
        </label>
      )}

      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={cn(
          'h-10 rounded-(--radius-md) border bg-(--color-surface) px-3 text-sm text-(--color-text)',
          'placeholder:text-(--color-text-subtle) transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)',
          error
            ? 'border-(--color-danger)'
            : 'border-(--color-border-strong) hover:border-(--color-text-subtle)',
          className
        )}
        {...rest}
      />

      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-(--color-danger)">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-(--color-text-muted)">
          {hint}
        </p>
      ) : null}
    </div>
  )
})
