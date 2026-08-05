import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Description, SectionTitle, Slider, Switch } from '@renderer/ui'
import { useWizardStore } from '@renderer/store/wizardStore'
import { Performance } from '@shared/wizardConfig'
import type { SystemMemoryInfo } from '@shared/systemInfo'

const MEMORY_SLIDER_CEILING_GB = 32

function recommendMemoryGB(maxPlayers: number | undefined): number {
  const players = maxPlayers ?? 20
  return Math.min(16, Math.max(2, Math.ceil(players / 10) + 2))
}

export function PerformanceStep() {
  const performance = useWizardStore((state) => state.answers.performance)
  const maxPlayers = useWizardStore((state) => state.answers.serverIdentity.maxPlayers)
  const updateAnswers = useWizardStore((state) => state.updateAnswers)
  const [memoryInfo, setMemoryInfo] = useState<SystemMemoryInfo | null>(null)

  useEffect(() => {
    window.blossom?.getMemoryInfo().then(setMemoryInfo)
  }, [])

  const patch = (data: Partial<Performance>) => updateAnswers({ performance: { ...performance, ...data } })
  const recommended = recommendMemoryGB(maxPlayers)
  const selectedMemory = performance.memoryGB ?? 4
  const sliderMax = memoryInfo ? Math.min(MEMORY_SLIDER_CEILING_GB, memoryInfo.totalGB) : MEMORY_SLIDER_CEILING_GB
  const exceedsRecommended = memoryInfo !== null && selectedMemory > memoryInfo.recommendedMaxGB

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
        max={sliderMax}
        value={Math.min(selectedMemory, sliderMax)}
        onChange={(value) => patch({ memoryGB: value })}
        hint={
          memoryInfo
            ? `Recommended for ${maxPlayers ?? 20} players: about ${recommended} GB. This machine has ${memoryInfo.totalGB} GB installed.`
            : `Recommended for ${maxPlayers ?? 20} players: about ${recommended} GB. Used for both the minimum and maximum heap size.`
        }
      />

      {exceedsRecommended && memoryInfo && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-(--radius-md) border border-(--color-warning) bg-(--color-warning)/10 px-3 py-2 text-sm text-(--color-warning)"
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>
            Leaving under {memoryInfo.totalGB - memoryInfo.recommendedMaxGB} GB for Windows and other programs
            can make the server fail to start or slow the whole machine down. Consider{' '}
            {memoryInfo.recommendedMaxGB} GB or less.
          </span>
        </p>
      )}

      <Switch
        label="Auto-Restart on Crash"
        description="The generated start script relaunches the server if it stops unexpectedly."
        checked={performance.autoRestart ?? true}
        onChange={(value) => patch({ autoRestart: value })}
      />
    </div>
  )
}
