import { HTMLAttributes } from 'react'
import { cn } from '@renderer/utils/cn'

export function PageTitle({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn('text-2xl font-semibold text-(--color-text)', className)} {...rest} />
}

export function SectionTitle({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold text-(--color-text)', className)} {...rest} />
}

export function Description({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-(--color-text-muted)', className)} {...rest} />
}
