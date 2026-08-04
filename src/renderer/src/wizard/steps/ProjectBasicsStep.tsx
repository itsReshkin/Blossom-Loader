import { useEffect, useState } from 'react'
import { FolderOpen } from 'lucide-react'
import { Button, Input, SectionTitle, Description } from '@renderer/ui'
import { useWizardStore } from '@renderer/store/wizardStore'
import { ProjectBasicsSchema } from '@shared/wizardConfig'

export function ProjectBasicsStep() {
  const projectBasics = useWizardStore((state) => state.answers.projectBasics)
  const updateAnswers = useWizardStore((state) => state.updateAnswers)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (projectBasics.installDirectory || !window.blossom) return
    window.blossom.getDefaultProjectsDirectory().then((dir) => {
      updateAnswers({ projectBasics: { ...projectBasics, installDirectory: dir } })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validation = ProjectBasicsSchema.safeParse(projectBasics)
  const fieldError = (field: keyof typeof projectBasics): string | undefined => {
    if (!touched[field]) return undefined
    const issue = validation.success
      ? undefined
      : validation.error.issues.find((issue) => issue.path[0] === field)
    return issue?.message
  }

  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }))

  const handleBrowse = async () => {
    if (!window.blossom) return
    const dir = await window.blossom.selectDirectory()
    if (dir) updateAnswers({ projectBasics: { ...projectBasics, installDirectory: dir } })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionTitle>Project Basics</SectionTitle>
        <Description className="mt-1">Name your server and choose where it will be created.</Description>
      </div>

      <Input
        label="Project Name"
        placeholder="My Survival Server"
        required
        value={projectBasics.projectName ?? ''}
        onChange={(e) => updateAnswers({ projectBasics: { ...projectBasics, projectName: e.target.value } })}
        onBlur={() => markTouched('projectName')}
        error={fieldError('projectName')}
        hint="Used as the folder name for your generated server."
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-(--color-text)">
          Install Location<span className="ml-1 text-(--color-danger)">*</span>
        </label>
        <div className="flex gap-2">
          <Input
            readOnly
            value={projectBasics.installDirectory ?? ''}
            placeholder="Choose a folder..."
            className="cursor-default"
          />
          <Button
            variant="secondary"
            leftIcon={<FolderOpen size={16} />}
            onClick={handleBrowse}
            type="button"
          >
            Browse
          </Button>
        </div>
        {fieldError('installDirectory') && (
          <p className="text-xs text-(--color-danger)">{fieldError('installDirectory')}</p>
        )}
      </div>
    </div>
  )
}
