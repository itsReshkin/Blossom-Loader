import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'
import { Description, SectionTitle } from './Typography'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Renderer crashed:', error, info.componentStack)
  }

  private handleReload = () => {
    window.location.reload()
  }

  render(): ReactNode {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Card className="flex w-full max-w-md flex-col gap-4 p-8">
          <div>
            <SectionTitle>Something went wrong</SectionTitle>
            <Description className="mt-1">
              Your wizard progress was saved, so reloading should pick up where you left off.
            </Description>
          </div>

          <pre className="max-h-32 overflow-y-auto rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) p-2.5 font-mono text-[11px] leading-relaxed text-(--color-text-subtle)">
            {error.message}
          </pre>

          <Button leftIcon={<RefreshCw size={16} />} onClick={this.handleReload}>
            Reload Blossom
          </Button>
        </Card>
      </div>
    )
  }
}
