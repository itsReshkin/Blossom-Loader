import { useState } from 'react'
import { Description, Input, SectionTitle, Select, Switch } from '@renderer/ui'
import { useWizardStore } from '@renderer/store/wizardStore'
import { WORLD_TYPE_VALUES, WorldSettings, WorldSettingsSchema } from '@shared/wizardConfig'

const WORLD_TYPE_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'flat', label: 'Flat' },
  { value: 'large_biomes', label: 'Large Biomes' },
  { value: 'amplified', label: 'Amplified' }
] satisfies { value: (typeof WORLD_TYPE_VALUES)[number]; label: string }[]

export function WorldSettingsStep() {
  const worldSettings = useWizardStore((state) => state.answers.worldSettings)
  const updateAnswers = useWizardStore((state) => state.updateAnswers)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validation = WorldSettingsSchema.safeParse(worldSettings)
  const fieldError = (field: keyof WorldSettings): string | undefined => {
    if (!touched[field]) return undefined
    const issue = validation.success
      ? undefined
      : validation.error.issues.find((issue) => issue.path[0] === field)
    return issue?.message
  }
  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }))
  const patch = (data: Partial<WorldSettings>) =>
    updateAnswers({ worldSettings: { ...worldSettings, ...data } })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionTitle>World Settings</SectionTitle>
        <Description className="mt-1">Shape the world your players will explore.</Description>
      </div>

      <Select
        label="World Type"
        required
        options={WORLD_TYPE_OPTIONS}
        value={worldSettings.worldType ?? ''}
        onChange={(e) => patch({ worldType: e.target.value as WorldSettings['worldType'] })}
      />

      <Input
        label="Seed"
        placeholder="Leave blank for a random world"
        value={worldSettings.seed ?? ''}
        onChange={(e) => patch({ seed: e.target.value })}
        onBlur={() => markTouched('seed')}
        error={fieldError('seed')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="View Distance"
          type="number"
          min={3}
          max={32}
          value={worldSettings.viewDistance ?? ''}
          onChange={(e) =>
            patch({ viewDistance: e.target.value === '' ? undefined : Number(e.target.value) })
          }
          onBlur={() => markTouched('viewDistance')}
          error={fieldError('viewDistance')}
          hint="Chunks, 3-32"
        />
        <Input
          label="Simulation Distance"
          type="number"
          min={3}
          max={32}
          value={worldSettings.simulationDistance ?? ''}
          onChange={(e) =>
            patch({ simulationDistance: e.target.value === '' ? undefined : Number(e.target.value) })
          }
          onBlur={() => markTouched('simulationDistance')}
          error={fieldError('simulationDistance')}
          hint="Chunks, 3-32"
        />
      </div>

      <Input
        label="Spawn Protection"
        type="number"
        min={0}
        max={64}
        value={worldSettings.spawnProtection ?? ''}
        onChange={(e) =>
          patch({ spawnProtection: e.target.value === '' ? undefined : Number(e.target.value) })
        }
        onBlur={() => markTouched('spawnProtection')}
        error={fieldError('spawnProtection')}
        hint="Radius around spawn only operators can edit. 0 disables it."
      />

      <Switch
        label="Generate Structures"
        description="Villages, temples, strongholds, and other structures will generate."
        checked={worldSettings.generateStructures ?? true}
        onChange={(value) => patch({ generateStructures: value })}
      />
    </div>
  )
}
