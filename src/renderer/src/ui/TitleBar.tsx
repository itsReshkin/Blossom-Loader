import { Blocks } from 'lucide-react'

export function TitleBar() {
  return (
    <div className="flex h-10 shrink-0 items-center gap-2 border-b border-(--color-border) px-4 [-webkit-app-region:drag]">
      <Blocks size={16} className="text-(--color-accent)" />
      <span className="text-sm font-medium text-(--color-text-muted)">Blossom</span>
    </div>
  )
}
