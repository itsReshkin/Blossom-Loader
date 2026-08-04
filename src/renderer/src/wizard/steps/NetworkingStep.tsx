import { useState } from 'react'
import { Description, Input, SectionTitle, Switch } from '@renderer/ui'
import { useWizardStore } from '@renderer/store/wizardStore'
import { Networking, NetworkingSchema } from '@shared/wizardConfig'

export function NetworkingStep() {
  const networking = useWizardStore((state) => state.answers.networking)
  const updateAnswers = useWizardStore((state) => state.updateAnswers)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

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

      <Switch
        label="Online Mode"
        description="Verifies players own the game via Mojang. Turn off only for offline/cracked setups or certain proxies — this reduces security."
        checked={networking.onlineMode ?? true}
        onChange={(value) => patch({ onlineMode: value })}
      />
    </div>
  )
}
