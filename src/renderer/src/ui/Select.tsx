import { SelectHTMLAttributes, forwardRef, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@renderer/utils/cn'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, options, placeholder, id, className, required, ...rest },
  ref
) {
  const autoId = useId()
  const selectId = id ?? autoId

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-(--color-text)">
          {label}
          {required && <span className="ml-1 text-(--color-danger)">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
          className={cn(
            'h-10 w-full appearance-none rounded-(--radius-md) border bg-(--color-surface) px-3 pr-9 text-sm text-(--color-text)',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)',
            error
              ? 'border-(--color-danger)'
              : 'border-(--color-border-strong) hover:border-(--color-text-subtle)',
            className
          )}
          defaultValue={rest.value === undefined && rest.defaultValue === undefined ? '' : undefined}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-subtle)"
        />
      </div>

      {error ? (
        <p id={`${selectId}-error`} className="text-xs text-(--color-danger)">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="text-xs text-(--color-text-muted)">
          {hint}
        </p>
      ) : null}
    </div>
  )
})
