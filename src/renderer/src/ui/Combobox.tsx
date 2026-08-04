import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@renderer/utils/cn'

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
}

export function Combobox({
  label,
  hint,
  error,
  required,
  placeholder,
  disabled,
  options,
  value,
  onChange
}: ComboboxProps) {
  const id = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const selectedOption = options.find((option) => option.value === value)
  const displayValue = open ? query : (selectedOption?.label ?? '')

  const filtered = query.trim()
    ? options.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options

  const closeList = () => {
    setOpen(false)
    setQuery('')
    setActiveIndex(0)
  }

  const openList = () => {
    setOpen(true)
    setActiveIndex(0)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeList()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const commit = (option: ComboboxOption) => {
    onChange(option.value)
    closeList()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      openList()
      return
    }
    if (!open) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const option = filtered[activeIndex]
      if (option) commit(option)
    } else if (event.key === 'Escape') {
      closeList()
    }
  }

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-(--color-text)">
          {label}
          {required && <span className="ml-1 text-(--color-danger)">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          aria-invalid={!!error}
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          value={displayValue}
          onFocus={openList}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
            setActiveIndex(0)
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            'h-10 w-full rounded-(--radius-md) border bg-(--color-surface) px-3 pr-9 text-sm text-(--color-text)',
            'placeholder:text-(--color-text-subtle) transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-(--color-danger)'
              : 'border-(--color-border-strong) hover:border-(--color-text-subtle)'
          )}
        />
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-subtle)"
        />

        {open && !disabled && (
          <ul
            id={`${id}-listbox`}
            role="listbox"
            className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-(--radius-md) border border-(--color-border-strong) bg-(--color-surface-raised) py-1 shadow-lg"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-(--color-text-subtle)">No matches</li>
            ) : (
              filtered.map((option, index) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  onMouseDown={(event) => {
                    event.preventDefault()
                    commit(option)
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    'cursor-pointer px-3 py-1.5 text-sm',
                    index === activeIndex
                      ? 'bg-(--color-accent-soft) text-(--color-accent)'
                      : 'text-(--color-text)',
                    option.value === value && 'font-medium'
                  )}
                >
                  {option.label}
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {error ? (
        <p className="text-xs text-(--color-danger)">{error}</p>
      ) : hint ? (
        <p className="text-xs text-(--color-text-muted)">{hint}</p>
      ) : null}
    </div>
  )
}
