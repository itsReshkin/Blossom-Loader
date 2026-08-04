const MODRINTH_API_BASE = 'https://api.modrinth.com/v2'
const MODRINTH_USER_AGENT = 'Blossom/0.1.0 (Minecraft server creation wizard)'

interface ModrinthVersionFile {
  url: string
  filename: string
  primary: boolean
  hashes: { sha1: string; sha512: string }
}

interface ModrinthVersion {
  version_number: string
  files: ModrinthVersionFile[]
}

export interface ModrinthDownloadInfo {
  url: string
  filename: string
  sha1: string
}

interface ModrinthSearchHit {
  slug: string
  title: string
  description: string
  icon_url: string | null
  downloads: number
}

interface ModrinthSearchResponse {
  hits: ModrinthSearchHit[]
  total_hits: number
}

export interface SearchProjectsParams {
  query: string
  loaderCategories: string[]
  gameVersion: string
  offset: number
  limit: number
}

export interface SearchProjectsResult {
  hits: { slug: string; name: string; description: string; iconUrl: string | null; downloads: number }[]
  totalHits: number
}

function modrinthHeaders(): Record<string, string> {
  return { 'User-Agent': MODRINTH_USER_AGENT }
}

export async function searchProjects(params: SearchProjectsParams): Promise<SearchProjectsResult> {
  const facets = JSON.stringify([
    params.loaderCategories.map((c) => `categories:${c}`),
    [`versions:${params.gameVersion}`]
  ])
  const query = new URLSearchParams({
    query: params.query,
    facets,
    limit: String(params.limit),
    offset: String(params.offset),
    index: params.query ? 'relevance' : 'downloads'
  })

  const response = await fetch(`${MODRINTH_API_BASE}/search?${query}`, { headers: modrinthHeaders() })
  if (!response.ok) {
    throw new Error(`Failed to search Modrinth: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as ModrinthSearchResponse
  return {
    hits: data.hits.map((hit) => ({
      slug: hit.slug,
      name: hit.title,
      description: hit.description,
      iconUrl: hit.icon_url,
      downloads: hit.downloads
    })),
    totalHits: data.total_hits
  }
}

export async function getVersionDownload(
  slug: string,
  loader: string,
  gameVersion: string
): Promise<ModrinthDownloadInfo> {
  const query = new URLSearchParams({
    loaders: JSON.stringify([loader]),
    game_versions: JSON.stringify([gameVersion])
  })
  const response = await fetch(`${MODRINTH_API_BASE}/project/${slug}/version?${query}`, {
    headers: modrinthHeaders()
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch ${slug} versions: ${response.status} ${response.statusText}`)
  }

  const versions = (await response.json()) as ModrinthVersion[]
  const latest = versions[0]
  if (!latest) {
    throw new Error(`${slug} has no build compatible with Minecraft ${gameVersion} on ${loader}.`)
  }

  const file = latest.files.find((entry) => entry.primary) ?? latest.files[0]
  if (!file) {
    throw new Error(`${slug} version ${latest.version_number} has no downloadable file.`)
  }

  return { url: file.url, filename: file.filename, sha1: file.hashes.sha1 }
}
