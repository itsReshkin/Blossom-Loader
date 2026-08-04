import { useEffect, useState } from 'react'
import { AlertTriangle, Download, Loader2 } from 'lucide-react'
import { SERVER_SOFTWARE_CATALOG, ServerSoftwareId } from '@shared/serverSoftware'
import type { PrerequisitesCheckResult } from '@shared/prerequisites'
import type { DownloadProgressEvent } from '@shared/downloads'
import { Button, Card, Combobox, Description, SectionTitle } from '@renderer/ui'
import { useWizardStore } from '@renderer/store/wizardStore'

export function ServerSoftwareStep() {
  const serverSoftware = useWizardStore((state) => state.answers.serverSoftware)
  const updateAnswers = useWizardStore((state) => state.updateAnswers)
  const [versions, setVersions] = useState<string[]>([])
  const [loadingVersions, setLoadingVersions] = useState(false)
  const [prerequisites, setPrerequisites] = useState<PrerequisitesCheckResult | null>(null)
  const [javaDownload, setJavaDownload] = useState<DownloadProgressEvent | null>(null)
  const [javaDownloadError, setJavaDownloadError] = useState<string | null>(null)

  const softwareId = serverSoftware.softwareId

  const refreshPrerequisites = () => {
    if (!window.blossom) return
    window.blossom.checkPrerequisites().then(setPrerequisites)
  }

  useEffect(refreshPrerequisites, [])

  useEffect(() => {
    if (!softwareId || !window.blossom) return
    let cancelled = false

    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-dependency-change pattern, guarded by `cancelled` below
    setLoadingVersions(true)
    setVersions([])

    const versionsPromise =
      softwareId === 'paper'
        ? window.blossom.getPaperSupportedVersions()
        : window.blossom.getMinecraftReleaseVersions()

    versionsPromise
      .then((result) => {
        if (!cancelled) setVersions(result)
      })
      .finally(() => {
        if (!cancelled) setLoadingVersions(false)
      })

    return () => {
      cancelled = true
    }
  }, [softwareId])

  const selectSoftware = (id: ServerSoftwareId) => {
    if (id === softwareId) return
    updateAnswers({ serverSoftware: { softwareId: id, minecraftVersion: undefined } })
  }

  const selectVersion = (version: string) =>
    updateAnswers({ serverSoftware: { ...serverSoftware, minecraftVersion: version } })

  const handleDownloadJava = async () => {
    if (!window.blossom) return
    setJavaDownloadError(null)
    setJavaDownload({ bytesReceived: 0, totalBytes: 0 })
    const unsubscribe = window.blossom.onDownloadProgress(setJavaDownload)
    try {
      await window.blossom.downloadJava()
      refreshPrerequisites()
    } catch (err) {
      setJavaDownloadError(err instanceof Error ? err.message : 'Failed to download Java.')
    } finally {
      unsubscribe()
      setJavaDownload(null)
    }
  }

  const needsJava = softwareId === 'fabric' || softwareId === 'forge' || softwareId === 'spigot'
  const needsGit = softwareId === 'spigot'
  const missingJava = needsJava && prerequisites && !prerequisites.java.available
  const missingGit = needsGit && prerequisites && !prerequisites.git.available
  const javaDownloadPct =
    javaDownload && javaDownload.totalBytes > 0
      ? Math.floor((javaDownload.bytesReceived / javaDownload.totalBytes) * 100)
      : null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionTitle>Server Software</SectionTitle>
        <Description className="mt-1">Choose the software that powers your server.</Description>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Server software">
        {SERVER_SOFTWARE_CATALOG.map((software) => (
          <Card
            key={software.id}
            interactive
            selected={softwareId === software.id}
            role="radio"
            aria-checked={softwareId === software.id}
            tabIndex={0}
            onClick={() => selectSoftware(software.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                selectSoftware(software.id)
              }
            }}
            className="flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-(--color-text)">{software.name}</span>
              {software.recommended && (
                <span className="rounded-full bg-(--color-accent-soft) px-2 py-0.5 text-[11px] font-medium text-(--color-accent)">
                  Recommended
                </span>
              )}
            </div>
            <p className="text-xs text-(--color-text-muted)">{software.description}</p>
          </Card>
        ))}
      </div>

      {(missingJava || missingGit) && (
        <div className="flex flex-col gap-2.5 rounded-(--radius-md) border border-(--color-warning) bg-(--color-warning)/10 px-3 py-2.5 text-sm text-(--color-warning)">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>
              {missingJava && missingGit
                ? 'Java and Git are required to build this server software and were not found on this machine.'
                : missingJava
                  ? 'Java is required to install this server software and was not found on this machine.'
                  : 'Git is required to build Spigot and was not found on this machine.'}
              {missingGit && (
                <>
                  {' '}
                  Install{' '}
                  <a
                    href="https://git-scm.com/downloads"
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Git
                  </a>{' '}
                  before generating.
                </>
              )}
            </span>
          </div>

          {missingJava && (
            <div className="flex flex-col gap-1.5 pl-6">
              {javaDownload ? (
                <div className="flex flex-col gap-1">
                  <div className="h-1.5 w-48 overflow-hidden rounded-full bg-(--color-border)">
                    <div
                      className="h-full rounded-full bg-(--color-accent) transition-all duration-150"
                      style={{ width: `${javaDownloadPct ?? 0}%` }}
                    />
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-(--color-text-muted)">
                    <Loader2 size={12} className="animate-spin" />
                    Downloading Java{javaDownloadPct !== null ? ` — ${javaDownloadPct}%` : '...'}
                  </p>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Download size={14} />}
                  onClick={handleDownloadJava}
                >
                  Download Java now
                </Button>
              )}
              {javaDownloadError && <p className="text-xs text-(--color-danger)">{javaDownloadError}</p>}
            </div>
          )}
        </div>
      )}

      {softwareId && (
        <Combobox
          label="Minecraft Version"
          required
          disabled={loadingVersions || versions.length === 0}
          placeholder={loadingVersions ? 'Loading versions...' : 'Search versions...'}
          hint={!loadingVersions && versions.length > 0 ? `${versions.length} versions available` : undefined}
          value={serverSoftware.minecraftVersion ?? ''}
          onChange={selectVersion}
          options={versions.map((version) => ({ value: version, label: version }))}
        />
      )}
    </div>
  )
}
