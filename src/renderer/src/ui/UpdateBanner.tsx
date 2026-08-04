import { useEffect, useState } from 'react'
import { Download, RefreshCw, X } from 'lucide-react'
import type { UpdateStatus } from '@shared/updater'
import { Button } from './Button'
import { cn } from '@renderer/utils/cn'

export function UpdateBanner() {
  const [status, setStatus] = useState<UpdateStatus | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => window.blossom.onUpdateStatus(setStatus), [])

  if (!status || dismissed || status.state === 'checking' || status.state === 'not-available') {
    return null
  }

  if (status.state === 'error') {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 border-b border-(--color-border-strong) bg-(--color-surface-raised) px-4 py-2 text-sm'
      )}
    >
      {status.state === 'available' && (
        <>
          <span className="text-(--color-text)">Version {status.version} is available.</span>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Download size={14} />}
            onClick={() => window.blossom.downloadUpdate()}
          >
            Download
          </Button>
        </>
      )}

      {status.state === 'downloading' && (
        <span className="text-(--color-text-muted)">Downloading update... {status.percent}%</span>
      )}

      {status.state === 'downloaded' && (
        <>
          <span className="text-(--color-text)">Version {status.version} is ready to install.</span>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<RefreshCw size={14} />}
            onClick={() => window.blossom.installUpdate()}
          >
            Restart & Install
          </Button>
        </>
      )}

      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="ml-auto text-(--color-text-muted) hover:text-(--color-text)"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  )
}
