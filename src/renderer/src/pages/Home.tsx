import { useEffect, useState } from 'react'
import { ArrowRight, Blocks, FolderOpen, Trash2, X } from 'lucide-react'
import { Button, Card, Description, PageTitle } from '@renderer/ui'
import { canResumeDraft, useWizardStore } from '@renderer/store/wizardStore'
import { useTranslation } from '@renderer/i18n'
import { SERVER_SOFTWARE_CATALOG } from '@shared/serverSoftware'
import type { ServerTemplate } from '@shared/templates'
import type { RegisteredServer } from '@shared/servers'

interface HomeProps {
  onStartWizard: () => void
}

function softwareName(softwareId: string): string {
  return SERVER_SOFTWARE_CATALOG.find((entry) => entry.id === softwareId)?.name ?? softwareId
}

export function Home({ onStartWizard }: HomeProps) {
  const [templates, setTemplates] = useState<ServerTemplate[]>([])
  const [servers, setServers] = useState<RegisteredServer[]>([])
  const updateAnswers = useWizardStore((state) => state.updateAnswers)
  const resetWizard = useWizardStore((state) => state.resetWizard)
  const draftName = useWizardStore((state) => state.answers.projectBasics.projectName)
  const showResume = useWizardStore(canResumeDraft)
  const { t } = useTranslation()

  const handleStartFresh = () => {
    resetWizard()
    onStartWizard()
  }

  useEffect(() => {
    window.blossom?.listTemplates().then(setTemplates)
    window.blossom?.listServers().then(setServers)
  }, [])

  const handleRemoveServer = async (id: string) => {
    await window.blossom?.unregisterServer(id)
    setServers((prev) => prev.filter((server) => server.id !== id))
  }

  const handleUseTemplate = (template: ServerTemplate) => {
    // Clear first, otherwise the template merges into whatever the last run left behind and the
    // wizard resumes on its final step instead of the beginning.
    resetWizard()
    // Templates saved before the Players step existed have no player list; keep the store's shape intact.
    const { players, ...rest } = template.answers
    updateAnswers({ ...rest, players: players ?? { entries: [] } })
    onStartWizard()
  }

  const handleDeleteTemplate = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    await window.blossom?.deleteTemplate(id)
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="flex w-full max-w-md flex-col gap-4">
        <Card className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-(--radius-lg) bg-(--color-accent-soft)">
            <Blocks className="text-(--color-accent)" size={24} />
          </div>

          <div className="flex flex-col gap-1.5">
            <PageTitle>Blossom</PageTitle>
            <Description>{t('home.tagline')}</Description>
          </div>

          <Button size="lg" fullWidth rightIcon={<ArrowRight size={16} />} onClick={handleStartFresh}>
            {t('home.createButton')}
          </Button>

          {showResume && (
            <Button variant="ghost" size="sm" fullWidth onClick={onStartWizard}>
              {t('home.resumeDraft', { name: draftName ?? '' })}
            </Button>
          )}
        </Card>

        {servers.length > 0 && (
          <Card className="flex flex-col gap-2 p-4">
            <Description className="px-1">Your servers</Description>
            {servers.map((server) => (
              <div
                key={server.id}
                className="flex items-center gap-3 rounded-(--radius-md) px-3 py-2 hover:bg-(--color-surface-raised)"
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm text-(--color-text)">{server.name}</span>
                  <span className="text-xs text-(--color-text-muted)">
                    {softwareName(server.softwareId)} {server.minecraftVersion} · Port {server.serverPort}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => window.blossom?.showItemInFolder(server.path)}
                  aria-label={`Open folder for ${server.name}`}
                  className="text-(--color-text-muted) hover:text-(--color-text)"
                >
                  <FolderOpen size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveServer(server.id)}
                  aria-label={`Remove ${server.name} from the list`}
                  className="text-(--color-text-muted) hover:text-(--color-danger)"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
            <Description className="px-1 text-xs">
              Removing a server here only forgets it in Blossom. The files stay on disk.
            </Description>
          </Card>
        )}

        {templates.length > 0 && (
          <Card className="flex flex-col gap-2 p-4">
            <Description className="px-1">{t('home.templatesHeading')}</Description>
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleUseTemplate(template)}
                className="flex items-center justify-between gap-2 rounded-(--radius-md) px-3 py-2 text-left text-sm text-(--color-text) transition-colors hover:bg-(--color-surface-raised)"
              >
                <span>{template.name}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => handleDeleteTemplate(template.id, e)}
                  className="text-(--color-text-muted) hover:text-(--color-danger)"
                  aria-label={t('home.deleteTemplateLabel', { name: template.name })}
                >
                  <Trash2 size={14} />
                </span>
              </button>
            ))}
          </Card>
        )}
      </div>
    </div>
  )
}
