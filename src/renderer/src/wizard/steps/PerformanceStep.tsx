import { Description, SectionTitle, Slider, Switch } from '@renderer/ui'
import { useWizardStore } from '@renderer/store/wizardStore'
import { Performance } from '@shared/wizardConfig'

function recommendMemoryGB(maxPlayers: number | undefined): number {
  const players = maxPlayers ?? 20
  return Math.min(16, Math.max(2, Math.ceil(players / 10) + 2))
}

export function PerformanceStep() {
  const performance = useWizardStore((state) => state.answers.performance)
  const maxPlayers = useWizardStore((state) => state.answers.serverIdentity.maxPlayers)
  const updateAnswers = useWizardStore((state) => state.updateAnswers)

  const patch = (data: Partial<Performance>) => updateAnswers({ performance: { ...performance, ...data } })
  const recommended = recommendMemoryGB(maxPlayers)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionTitle>Performance</SectionTitle>
        <Description className="mt-1">Allocate resources for your server.</Description>
      </div>

      <Slider
        label="Memory Allocation"
        unit=" GB"
        min={1}
        max={32}
        value={performance.memoryGB ?? 4}
        onChange={(value) => patch({ memoryGB: value })}
        hint={`Recommended for ${maxPlayers ?? 20} players: about ${recommended} GB. Used for both the minimum and maximum heap size.`}
      />

      <Switch
        label="Auto-Restart on Crash"
        description="The generated start script relaunches the server if it stops unexpectedly."
        checked={performance.autoRestart ?? true}
        onChange={(value) => patch({ autoRestart: value })}
      />
    </div>
  )
}
