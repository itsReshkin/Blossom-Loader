import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Card, Description } from '@renderer/ui'
import type { LocalNetworkAddress } from '@shared/systemInfo'

interface ConnectionInfoProps {
  serverPort: number
}

export function ConnectionInfo({ serverPort }: ConnectionInfoProps) {
  const [addresses, setAddresses] = useState<LocalNetworkAddress[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    window.blossom?.getLocalNetworkAddresses().then(setAddresses)
  }, [])

  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value)
    setCopied(value)
    setTimeout(() => setCopied(null), 2000)
  }

  const lanAddress = addresses[0] ? `${addresses[0].address}:${serverPort}` : null

  return (
    <Card className="flex w-full flex-col gap-3 p-4 text-left">
      <Description>How to connect</Description>

      <div className="flex flex-col gap-2 text-sm">
        <AddressRow
          label="On this computer"
          value={`localhost:${serverPort}`}
          copied={copied === `localhost:${serverPort}`}
          onCopy={handleCopy}
        />
        {lanAddress && (
          <AddressRow
            label="Same Wi-Fi or network"
            value={lanAddress}
            copied={copied === lanAddress}
            onCopy={handleCopy}
          />
        )}
      </div>

      <Description className="text-xs">
        For friends outside your network you need to forward port {serverPort} in your router, or use a
        tunneling service. Your public IP is not shown here because it changes.
      </Description>
    </Card>
  )
}

interface AddressRowProps {
  label: string
  value: string
  copied: boolean
  onCopy: (value: string) => void
}

function AddressRow({ label, value, copied, onCopy }: AddressRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-(--color-text-muted)">{label}</span>
      <button
        type="button"
        onClick={() => onCopy(value)}
        aria-label={`Copy ${value}`}
        className="flex items-center gap-2 rounded-(--radius-md) px-2 py-1 font-mono text-(--color-text) transition-colors hover:bg-(--color-surface-raised)"
      >
        {value}
        {copied ? <Check size={13} className="text-(--color-accent)" /> : <Copy size={13} />}
      </button>
    </div>
  )
}
