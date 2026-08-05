import { useState } from 'react'
import { BookmarkPlus, CheckCircle2, FolderOpen, Loader2 } from 'lucide-react'
import { Button, Card, Description, SectionTitle } from '@renderer/ui'
import { useWizardStore } from '@renderer/store/wizardStore'
import { SERVER_SOFTWARE_CATALOG } from '@shared/serverSoftware'
import { ConnectionInfo } from '../ConnectionInfo'

interface DownloadInfo {
  label: string
  bytesReceived: number
  totalBytes: number
}

type GenerationState =
  | { phase: 'idle' }
  | { phase: 'working'; status: string; download?: DownloadInfo; logTail: string[] }
  | { phase: 'success'; projectPath: string }
  | { phase: 'error'; message: string }

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-(--color-text-muted)">{label}</span>
      <span className="text-right font-medium text-(--color-text)">{value || '—'}</span>
    </div>
  )
}

export function ReviewGenerateStep() {
  const answers = useWizardStore((state) => state.answers)
  const resetWizard = useWizardStore((state) => state.resetWizard)
  const [eulaAccepted, setEulaAccepted] = useState(false)
  const [state, setState] = useState<GenerationState>({ phase: 'idle' })
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [templateSaved, setTemplateSaved] = useState(false)

  const software = SERVER_SOFTWARE_CATALOG.find((entry) => entry.id === answers.serverSoftware.softwareId)
  const selectedPlugins = answers.plugins.selected
  const isBusy = state.phase === 'working'

  const handleGenerate = async () => {
    if (!window.blossom || !eulaAccepted) return
    const { softwareId, minecraftVersion } = answers.serverSoftware
    if (!softwareId || !minecraftVersion) return

    setState({ phase: 'working', status: 'Starting...', logTail: [] })

    const unsubscribeDownload = window.blossom.onDownloadProgress((progress) => {
      setState((prev) =>
        prev.phase === 'working' && prev.download
          ? { ...prev, download: { ...prev.download, ...progress } }
          : prev
      )
    })
    const unsubscribeGenerate = window.blossom.onGenerateProgress((event) => {
      setState((prev) => {
        if (prev.phase !== 'working') return prev
        if (event.kind === 'status') return { ...prev, status: event.message, download: undefined }
        if (event.kind === 'download') {
          return {
            ...prev,
            download: { label: event.label, bytesReceived: event.bytesReceived, totalBytes: event.totalBytes }
          }
        }
        return { ...prev, logTail: [...prev.logTail.slice(-19), event.line] }
      })
    })

    try {
      const pluginFiles: { filePath: string; fileName: string }[] = []
      for (const [index, plugin] of selectedPlugins.entries()) {
        setState({
          phase: 'working',
          status: `Downloading ${plugin.name} (${index + 1}/${selectedPlugins.length})`,
          download: { label: plugin.name, bytesReceived: 0, totalBytes: 0 },
          logTail: []
        })
        const pluginDownload = await window.blossom.downloadPlugin({
          slug: plugin.slug,
          loader: softwareId,
          minecraftVersion
        })
        pluginFiles.push(pluginDownload)
      }

      setState({ phase: 'working', status: 'Preparing server software...', logTail: [] })
      const result = await window.blossom.generateProject({ answers, eulaAccepted: true, pluginFiles })

      await window.blossom.registerServer({
        name: answers.projectBasics.projectName ?? 'Minecraft Server',
        path: result.projectPath,
        softwareId,
        minecraftVersion,
        serverPort: answers.networking.serverPort ?? 25565
      })

      unsubscribeDownload()
      unsubscribeGenerate()
      setState({ phase: 'success', projectPath: result.projectPath })
    } catch (err) {
      unsubscribeDownload()
      unsubscribeGenerate()
      setState({ phase: 'error', message: err instanceof Error ? err.message : 'Something went wrong.' })
    }
  }

  const handleSaveTemplate = async () => {
    if (!window.blossom) return
    const name = window.prompt('Name this template')?.trim()
    if (!name) return

    setSavingTemplate(true)
    try {
      await window.blossom.saveTemplate({
        name,
        answers: {
          serverSoftware: answers.serverSoftware,
          serverIdentity: answers.serverIdentity,
          worldSettings: answers.worldSettings,
          performance: answers.performance,
          networking: answers.networking,
          players: answers.players
        }
      })
      setTemplateSaved(true)
      setTimeout(() => setTemplateSaved(false), 2500)
    } finally {
      setSavingTemplate(false)
    }
  }

  const handleOpenFolder = () => {
    if (state.phase === 'success' && window.blossom) {
      window.blossom.showItemInFolder(state.projectPath)
    }
  }

  if (state.phase === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-(--color-accent-soft)">
          <CheckCircle2 className="text-(--color-accent)" size={28} />
        </div>
        <div>
          <SectionTitle>Your server is ready</SectionTitle>
          <Description className="mt-1 break-all">{state.projectPath}</Description>
        </div>

        <ConnectionInfo serverPort={answers.networking.serverPort ?? 25565} />

        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={<FolderOpen size={16} />} onClick={handleOpenFolder}>
            Open Folder
          </Button>
          <Button onClick={resetWizard}>Create Another Server</Button>
        </div>
      </div>
    )
  }

  const progressPct =
    state.phase === 'working' && state.download && state.download.totalBytes > 0
      ? Math.floor((state.download.bytesReceived / state.download.totalBytes) * 100)
      : null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionTitle>Review & Generate</SectionTitle>
        <Description className="mt-1">Double-check your choices, then create your server.</Description>
      </div>

      <Card className="flex flex-col gap-2.5 p-4 text-sm">
        <SummaryRow label="Project" value={answers.projectBasics.projectName} />
        <SummaryRow label="Location" value={answers.projectBasics.installDirectory} />
        <SummaryRow
          label="Software"
          value={[software?.name, answers.serverSoftware.minecraftVersion].filter(Boolean).join(' ')}
        />
        {selectedPlugins.length > 0 && (
          <SummaryRow label="Plugins / Mods" value={selectedPlugins.map((entry) => entry.name).join(', ')} />
        )}
        {answers.players.entries.length > 0 && (
          <SummaryRow
            label="Players"
            value={answers.players.entries
              .map((entry) => (entry.isOperator ? `${entry.username} (op)` : entry.username))
              .join(', ')}
          />
        )}
        <SummaryRow label="MOTD" value={answers.serverIdentity.motd} />
        <SummaryRow label="Max Players" value={String(answers.serverIdentity.maxPlayers ?? '')} />
        <SummaryRow
          label="Difficulty / Game Mode"
          value={[answers.serverIdentity.difficulty, answers.serverIdentity.gamemode]
            .filter(Boolean)
            .join(' / ')}
        />
        <SummaryRow label="World Type" value={answers.worldSettings.worldType} />
        <SummaryRow
          label="Memory"
          value={answers.performance.memoryGB ? `${answers.performance.memoryGB} GB` : undefined}
        />
        <SummaryRow label="Port" value={String(answers.networking.serverPort ?? '')} />
      </Card>

      <label className="flex items-start gap-2 text-sm text-(--color-text-muted)">
        <input
          type="checkbox"
          checked={eulaAccepted}
          onChange={(e) => setEulaAccepted(e.target.checked)}
          disabled={isBusy}
          className="mt-0.5 size-4 accent-(--color-accent)"
        />
        <span>
          I have read and accept the{' '}
          <a
            href="https://aka.ms/MinecraftEULA"
            target="_blank"
            rel="noreferrer"
            className="text-(--color-accent) underline"
          >
            Minecraft End User License Agreement
          </a>
          . Minecraft servers must comply with Mojang&apos;s EULA.
        </span>
      </label>

      {state.phase === 'error' && (
        <p
          role="alert"
          className="rounded-(--radius-md) border border-(--color-danger) bg-(--color-danger)/10 px-3 py-2 text-sm text-(--color-danger)"
        >
          {state.message}
        </p>
      )}

      {state.phase === 'working' && (
        <div role="status" aria-live="polite" className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-sm text-(--color-text-muted)">
            <Loader2 size={16} className="animate-spin shrink-0" />
            {state.status}
          </p>

          {state.download && (
            <div className="flex flex-col gap-1.5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--color-border)">
                <div
                  className="h-full rounded-full bg-(--color-accent) transition-all duration-150"
                  style={{ width: `${progressPct ?? 0}%` }}
                />
              </div>
              <p className="text-xs text-(--color-text-muted)">
                {state.download.label}
                {progressPct !== null ? ` — ${progressPct}%` : '...'}
              </p>
            </div>
          )}

          {state.logTail.length > 0 && (
            <pre className="max-h-40 overflow-y-auto rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) p-2.5 font-mono text-[11px] leading-relaxed text-(--color-text-subtle)">
              {state.logTail.join('\n')}
            </pre>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="secondary"
          leftIcon={<BookmarkPlus size={16} />}
          disabled={isBusy || savingTemplate}
          onClick={handleSaveTemplate}
        >
          {templateSaved ? 'Saved!' : savingTemplate ? 'Saving...' : 'Save as Template'}
        </Button>
        <Button size="lg" className="flex-1" disabled={!eulaAccepted || isBusy} onClick={handleGenerate}>
          {isBusy ? 'Working...' : 'Generate Server'}
        </Button>
      </div>
    </div>
  )
}
