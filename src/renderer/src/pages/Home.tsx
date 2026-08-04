import { useEffect, useState } from 'react'
import { ArrowRight, Blocks, Trash2 } from 'lucide-react'
import { Button, Card, Description, PageTitle } from '@renderer/ui'
import { useWizardStore } from '@renderer/store/wizardStore'
import { useTranslation } from '@renderer/i18n'
import type { ServerTemplate } from '@shared/templates'

interface HomeProps {
  onStartWizard: () => void
}

export function Home({ onStartWizard }: HomeProps) {
  const [templates, setTemplates] = useState<ServerTemplate[]>([])
  const updateAnswers = useWizardStore((state) => state.updateAnswers)
  const { t } = useTranslation()

  useEffect(() => {
    window.blossom?.listTemplates().then(setTemplates)
  }, [])

  const handleUseTemplate = (template: ServerTemplate) => {
    updateAnswers(template.answers)
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

          <Button size="lg" fullWidth rightIcon={<ArrowRight size={16} />} onClick={onStartWizard}>
            {t('home.createButton')}
          </Button>
        </Card>

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
