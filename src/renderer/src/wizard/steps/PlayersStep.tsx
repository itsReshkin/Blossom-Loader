import { useState } from 'react'
import { AlertTriangle, Plus, Shield, Trash2 } from 'lucide-react'
import { Button, Card, Description, Input, SectionTitle } from '@renderer/ui'
import { useWizardStore } from '@renderer/store/wizardStore'
import { PlayerEntrySchema } from '@shared/wizardConfig'

export function PlayersStep() {
  const players = useWizardStore((state) => state.answers.players)
  const whitelistEnabled = useWizardStore((state) => state.answers.serverIdentity.whitelist)
  const onlineMode = useWizardStore((state) => state.answers.networking.onlineMode)
  const updateAnswers = useWizardStore((state) => state.updateAnswers)

  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | undefined>()

  const entries = players.entries
  const setEntries = (next: typeof entries) => updateAnswers({ players: { entries: next } })

  const handleAdd = () => {
    const parsed = PlayerEntrySchema.safeParse({ username: draft, isOperator: false })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message)
      return
    }

    if (entries.some((entry) => entry.username.toLowerCase() === parsed.data.username.toLowerCase())) {
      setError('That player is already on the list')
      return
    }

    setEntries([...entries, parsed.data])
    setDraft('')
    setError(undefined)
  }

  const toggleOperator = (username: string) => {
    setEntries(
      entries.map((entry) =>
        entry.username === username ? { ...entry, isOperator: !entry.isOperator } : entry
      )
    )
  }

  const removeEntry = (username: string) => {
    setEntries(entries.filter((entry) => entry.username !== username))
  }

  const lockedOut = whitelistEnabled === true && entries.length === 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionTitle>Players</SectionTitle>
        <Description className="mt-1">
          Add yourself and your friends. Operators can run admin commands like /gamemode and /stop.
        </Description>
      </div>

      <div className="flex items-end gap-2">
        <Input
          label="Minecraft Username"
          placeholder="Notch"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            setError(undefined)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
          error={error}
          hint={
            onlineMode === false
              ? 'Online Mode is off, so names are not verified against Mojang.'
              : 'Names are verified against Mojang when the server is generated.'
          }
          className="flex-1"
        />
        <Button
          variant="secondary"
          leftIcon={<Plus size={16} />}
          onClick={handleAdd}
          disabled={draft.trim() === ''}
          className="mb-6"
        >
          Add
        </Button>
      </div>

      {lockedOut && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-(--radius-md) border border-(--color-warning) bg-(--color-warning)/10 px-3 py-2 text-sm text-(--color-warning)"
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>
            You enabled the whitelist but have not added anyone. Nobody — including you — would be able to
            join. Add at least your own name here.
          </span>
        </p>
      )}

      {entries.length > 0 && (
        <Card className="flex flex-col divide-y divide-(--color-border) p-0">
          {entries.map((entry) => (
            <div key={entry.username} className="flex items-center gap-3 px-4 py-2.5">
              <span className="flex-1 text-sm text-(--color-text)">{entry.username}</span>

              <button
                type="button"
                onClick={() => toggleOperator(entry.username)}
                aria-pressed={entry.isOperator}
                className={
                  entry.isOperator
                    ? 'flex items-center gap-1.5 rounded-(--radius-md) bg-(--color-accent-soft) px-2.5 py-1 text-xs font-medium text-(--color-accent)'
                    : 'flex items-center gap-1.5 rounded-(--radius-md) px-2.5 py-1 text-xs text-(--color-text-muted) hover:text-(--color-text)'
                }
              >
                <Shield size={13} />
                Operator
              </button>

              <button
                type="button"
                onClick={() => removeEntry(entry.username)}
                aria-label={`Remove ${entry.username}`}
                className="text-(--color-text-muted) hover:text-(--color-danger)"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
