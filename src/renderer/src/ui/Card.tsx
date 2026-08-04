import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@renderer/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  selected?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { interactive, selected, className, children, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-(--radius-lg) border bg-(--color-surface) p-4',
        selected
          ? 'border-(--color-accent) bg-(--color-accent-soft)'
          : 'border-(--color-border) hover:border-(--color-border-strong)',
        interactive && 'cursor-pointer transition-colors duration-150',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
})
