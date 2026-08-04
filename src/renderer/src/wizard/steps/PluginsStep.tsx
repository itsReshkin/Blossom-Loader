import { useEffect, useState } from 'react'
import { Loader2, Package, Search } from 'lucide-react'
import type { PluginSearchHit } from '@shared/pluginSearch'
import { Button, Card, Description, SectionTitle } from '@renderer/ui'
import { useWizardStore } from '@renderer/store/wizardStore'

function formatDownloads(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`
  return String(count)
}

export function PluginsStep() {
  const softwareId = useWizardStore((state) => state.answers.serverSoftware.softwareId)
  const minecraftVersion = useWizardStore((state) => state.answers.serverSoftware.minecraftVersion)
  const selected = useWizardStore((state) => state.answers.plugins.selected)
  const updateAnswers = useWizardStore((state) => state.updateAnswers)

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [hits, setHits] = useState<PluginSearchHit[]>([])
  const [totalHits, setTotalHits] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const isPluginEcosystem = softwareId === 'paper' || softwareId === 'spigot'
  const kind = isPluginEcosystem ? 'plugins' : 'mods'

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), 350)
    return () => clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    if (!window.blossom || !softwareId || !minecraftVersion) return
    let cancelled = false

    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-dependency-change pattern, guarded by `cancelled` below
    setLoading(true)
    window.blossom
      .searchPlugins({ query: debouncedQuery, softwareId, minecraftVersion, offset: 0 })
      .then((result) => {
        if (cancelled) return
        setHits(result.hits)
        setTotalHits(result.totalHits)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedQuery, softwareId, minecraftVersion])

  const loadMore = async () => {
    if (!window.blossom || !softwareId || !minecraftVersion) return
    setLoadingMore(true)
    try {
      const result = await window.blossom.searchPlugins({
        query: debouncedQuery,
        softwareId,
        minecraftVersion,
        offset: hits.length
      })
      setHits((prev) => [...prev, ...result.hits])
    } finally {
      setLoadingMore(false)
    }
  }

  const toggle = (hit: PluginSearchHit) => {
    const isSelected = selected.some((entry) => entry.slug === hit.slug)
    const next = isSelected
      ? selected.filter((entry) => entry.slug !== hit.slug)
      : [...selected, { slug: hit.slug, name: hit.name }]
    updateAnswers({ plugins: { selected: next } })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <SectionTitle>{isPluginEcosystem ? 'Plugins' : 'Mods'}</SectionTitle>
        <Description className="mt-1">
          Optional. Search Modrinth&apos;s full catalog — selected {kind} are downloaded and installed
          automatically when your server is generated.
        </Description>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-subtle)"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${kind}...`}
          className="h-10 w-full rounded-(--radius-md) border border-(--color-border-strong) bg-(--color-surface) pl-9 pr-3 text-sm text-(--color-text) placeholder:text-(--color-text-subtle) transition-colors duration-150 hover:border-(--color-text-subtle) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
        />
      </div>

      {selected.length > 0 && (
        <p className="text-xs text-(--color-text-muted)">
          {selected.length} selected: {selected.map((entry) => entry.name).join(', ')}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-(--color-text-muted)">
            <Loader2 size={16} className="animate-spin" />
            Searching...
          </div>
        ) : hits.length === 0 ? (
          <p className="py-8 text-center text-sm text-(--color-text-muted)">No {kind} found.</p>
        ) : (
          <>
            <p className="text-xs text-(--color-text-subtle)">{totalHits.toLocaleString()} results</p>
            <div className="flex max-h-96 flex-col gap-2 overflow-y-auto pr-1">
              {hits.map((hit) => {
                const isSelected = selected.some((entry) => entry.slug === hit.slug)
                return (
                  <Card
                    key={hit.slug}
                    interactive
                    selected={isSelected}
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() => toggle(hit)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggle(hit)
                      }
                    }}
                    className="flex items-start gap-3 p-3"
                  >
                    {hit.iconUrl ? (
                      <img src={hit.iconUrl} alt="" className="size-9 shrink-0 rounded-(--radius-sm)" />
                    ) : (
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-(--radius-sm) bg-(--color-surface-raised)">
                        <Package size={16} className="text-(--color-text-subtle)" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium text-(--color-text)">{hit.name}</span>
                        <span className="shrink-0 text-[11px] text-(--color-text-subtle)">
                          {formatDownloads(hit.downloads)} downloads
                        </span>
                      </div>
                      <p className="line-clamp-2 text-xs text-(--color-text-muted)">{hit.description}</p>
                    </div>
                  </Card>
                )
              })}
            </div>

            {hits.length < totalHits && (
              <Button variant="secondary" size="sm" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading...' : 'Load more'}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
