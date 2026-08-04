import { useId } from 'react'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  hint?: string
  onChange: (value: number) => void
}

export function Slider({ label, value, min, max, step = 1, unit, hint, onChange }: SliderProps) {
  const id = useId()

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-(--color-text)">
          {label}
        </label>
        <span className="text-sm font-medium text-(--color-accent)">
          {value}
          {unit}
        </span>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-(--color-border) accent-(--color-accent)"
      />

      {hint && <p className="text-xs text-(--color-text-muted)">{hint}</p>}
    </div>
  )
}
