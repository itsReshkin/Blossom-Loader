import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import { cn } from '@renderer/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-(--color-accent) text-[#062018] hover:bg-(--color-accent-strong) disabled:bg-(--color-accent) disabled:opacity-40',
  secondary:
    'bg-(--color-surface-raised) text-(--color-text) border border-(--color-border-strong) hover:border-(--color-accent) disabled:opacity-40',
  ghost:
    'bg-transparent text-(--color-text-muted) hover:bg-(--color-surface-raised) hover:text-(--color-text) disabled:opacity-40',
  danger: 'bg-(--color-danger) text-[#2a0a0a] hover:brightness-110 disabled:opacity-40'
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    fullWidth,
    className,
    children,
    disabled,
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-(--radius-md) font-medium transition-colors duration-150',
        'disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  )
})
