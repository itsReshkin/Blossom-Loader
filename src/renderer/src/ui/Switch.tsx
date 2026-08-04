import { useId } from 'react'
import { cn } from '@renderer/utils/cn'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  id?: string
}

export function Switch({ checked, onChange, label, description, id }: SwitchProps) {
  const autoId = useId()
  const switchId = id ?? autoId

  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div>
        <label htmlFor={switchId} className="text-sm font-medium text-(--color-text)">
          {label}
        </label>
        {description && <p className="text-xs text-(--color-text-muted)">{description}</p>}
      </div>

      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-surface)',
          checked ? 'bg-(--color-accent)' : 'bg-(--color-border-strong)'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform duration-150',
            checked && 'translate-x-5'
          )}
        />
      </button>
    </div>
  )
}
