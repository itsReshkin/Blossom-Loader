import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Description, Input, SectionTitle, Switch } from '@renderer/ui'
import { useWizardStore } from '@renderer/store/wizardStore'
import { Networking, NetworkingSchema } from '@shared/wizardConfig'

const PORT_CHECK_DEBOUNCE_MS = 500

export function NetworkingStep() {
  const networking = useWizardStore((state) => state.answers.networking)
  const updateAnswers = useWizardStore((state) => state.updateAnswers)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  // Remember which port came back as occupied rather than a bare boolean, so the warning
  // disappears on its own as soon as the user edits the field again.
  const [occupiedPort, setOccupiedPort] = useState<number | null>(null)

  const port = networking.serverPort
  const portInUse = occupiedPort !== null && occupiedPort === port

  useEffect(() => {
    if (!port || port < 1 || port > 65535) return

    let cancelled = false
    const timer = setTimeout(() => {
      window.blossom?.checkPort(port).then((result) => {
        if (!cancelled && !result.available) setOccupiedPort(result.port)
      })
    }, PORT_CHECK_DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [port])

  const validation = NetworkingSchema.safeParse(networking)
  const fieldError = (field: keyof Networking): string | undefined => {
    if (!touched[field]) return undefined
    const issue = validation.success
      ? undefined
      : validation.error.issues.find((issue) => issue.path[0] === field)
    return issue?.message
  }
  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }))
  const patch = (data: Partial<Networking>) => updateAnswers({ networking: { ...networking, ...data } })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionTitle>Networking</SectionTitle>
        <Description className="mt-1">How players connect to your server.</Description>
      </div>

      <Input
        label="Server Port"
        type="number"
        required
        min={1}
        max={65535}
        value={networking.serverPort ?? ''}
        onChange={(e) => patch({ serverPort: e.target.value === '' ? undefined : Number(e.target.value) })}
        onBlur={() => markTouched('serverPort')}
        error={fieldError('serverPort')}
        hint="The default Minecraft port is 25565."
      />

      {portInUse && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-(--radius-md) border border-(--color-warning) bg-(--color-warning)/10 px-3 py-2 text-sm text-(--color-warning)"
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>
            Port {port} is currently in use on this machine. That is fine if you plan to host the server
            elsewhere, but running it here will fail until the other program releases the port.
          </span>
        </p>
      )}

      <Switch
        label="Online Mode"
        description="Verifies players own the game via Mojang. Turn off only for offline/cracked setups or certain proxies — this reduces security."
        checked={networking.onlineMode ?? true}
        onChange={(value) => patch({ onlineMode: value })}
      />
    </div>
  )
}
