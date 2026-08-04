import { useState } from 'react'
import { Description, Input, SectionTitle, Select, Switch } from '@renderer/ui'
import { useWizardStore } from '@renderer/store/wizardStore'
import {
  DIFFICULTY_VALUES,
  GAMEMODE_VALUES,
  ServerIdentity,
  ServerIdentitySchema
} from '@shared/wizardConfig'

const DIFFICULTY_OPTIONS = DIFFICULTY_VALUES.map((value) => ({
  value,
  label: value[0].toUpperCase() + value.slice(1)
}))

const GAMEMODE_OPTIONS = GAMEMODE_VALUES.map((value) => ({
  value,
  label: value[0].toUpperCase() + value.slice(1)
}))

export function ServerIdentityStep() {
  const identity = useWizardStore((state) => state.answers.serverIdentity)
  const updateAnswers = useWizardStore((state) => state.updateAnswers)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validation = ServerIdentitySchema.safeParse(identity)
  const fieldError = (field: keyof ServerIdentity): string | undefined => {
    if (!touched[field]) return undefined
    const issue = validation.success
      ? undefined
      : validation.error.issues.find((issue) => issue.path[0] === field)
    return issue?.message
  }
  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }))
  const patch = (data: Partial<ServerIdentity>) => updateAnswers({ serverIdentity: { ...identity, ...data } })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionTitle>Server Identity</SectionTitle>
        <Description className="mt-1">How your server introduces itself to players.</Description>
      </div>

      <Input
        label="Message of the Day"
        required
        maxLength={59}
        value={identity.motd ?? ''}
        onChange={(e) => patch({ motd: e.target.value })}
        onBlur={() => markTouched('motd')}
        error={fieldError('motd')}
        hint="Shown in the multiplayer server list."
      />

      <Input
        label="Max Players"
        type="number"
        required
        min={1}
        max={200}
        value={identity.maxPlayers ?? ''}
        onChange={(e) => patch({ maxPlayers: e.target.value === '' ? undefined : Number(e.target.value) })}
        onBlur={() => markTouched('maxPlayers')}
        error={fieldError('maxPlayers')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Difficulty"
          required
          options={DIFFICULTY_OPTIONS}
          value={identity.difficulty ?? ''}
          onChange={(e) => patch({ difficulty: e.target.value as ServerIdentity['difficulty'] })}
        />
        <Select
          label="Game Mode"
          required
          options={GAMEMODE_OPTIONS}
          value={identity.gamemode ?? ''}
          onChange={(e) => patch({ gamemode: e.target.value as ServerIdentity['gamemode'] })}
        />
      </div>

      <div className="flex flex-col divide-y divide-(--color-border) rounded-(--radius-md) border border-(--color-border) px-4">
        <Switch
          label="Hardcore Mode"
          description="The world is deleted permanently on death."
          checked={identity.hardcore ?? false}
          onChange={(value) => patch({ hardcore: value })}
        />
        <Switch
          label="PvP"
          description="Allow players to fight each other."
          checked={identity.pvp ?? true}
          onChange={(value) => patch({ pvp: value })}
        />
        <Switch
          label="Whitelist"
          description="Only approved players may join."
          checked={identity.whitelist ?? false}
          onChange={(value) => patch({ whitelist: value })}
        />
      </div>
    </div>
  )
}
