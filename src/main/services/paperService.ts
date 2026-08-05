import { USER_AGENT as PAPER_USER_AGENT } from '../core/userAgent'

const PAPER_API_BASE = 'https://fill.papermc.io/v3'

interface PaperVersionsResponse {
  versions: Record<string, string[]>
}

interface PaperBuild {
  id: number
  channel: string
  downloads: Record<string, { name: string; url: string; checksums: { sha256: string } }>
}

export interface PaperDownloadInfo {
  url: string
  sha256: string
  filename: string
}

function paperHeaders(): Record<string, string> {
  return { 'User-Agent': PAPER_USER_AGENT }
}

export async function getSupportedVersions(): Promise<string[]> {
  const response = await fetch(`${PAPER_API_BASE}/projects/paper`, { headers: paperHeaders() })
  if (!response.ok) {
    throw new Error(`Failed to fetch Paper supported versions: ${response.status} ${response.statusText}`)
  }
  const data = (await response.json()) as PaperVersionsResponse
  const allVersions = Object.values(data.versions).flat()
  return allVersions.filter((version) => !/-(pre|rc)/i.test(version))
}

export async function getLatestBuildDownload(version: string): Promise<PaperDownloadInfo> {
  const buildsUrl = `${PAPER_API_BASE}/projects/paper/versions/${version}/builds`
  const response = await fetch(buildsUrl, { headers: paperHeaders() })
  if (!response.ok) {
    throw new Error(`Paper does not have builds for Minecraft ${version}.`)
  }
  const builds = (await response.json()) as PaperBuild[]

  const stableBuilds = builds.filter((build) => build.channel === 'STABLE')
  const latest = (stableBuilds.length > 0 ? stableBuilds : builds)[0]
  if (!latest) {
    throw new Error(`No Paper builds found for Minecraft ${version}.`)
  }

  const download = latest.downloads['server:default']
  if (!download) {
    throw new Error(`Paper build ${latest.id} has no server download.`)
  }

  return { url: download.url, sha256: download.checksums.sha256, filename: download.name }
}
