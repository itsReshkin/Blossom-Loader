import { REQUEST_HEADERS } from '../core/userAgent'

const VERSION_MANIFEST_URL = 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json'

interface MojangManifestEntry {
  id: string
  type: string
  url: string
  releaseTime: string
}

interface MojangManifest {
  versions: MojangManifestEntry[]
}

interface MojangVersionDetail {
  downloads: {
    server?: {
      url: string
      sha1: string
      size: number
    }
  }
}

export interface MinecraftReleaseVersion {
  id: string
  releaseTime: string
}

export interface ServerDownloadInfo {
  url: string
  sha1: string
  size: number
}

async function fetchManifest(): Promise<MojangManifest> {
  const response = await fetch(VERSION_MANIFEST_URL, { headers: REQUEST_HEADERS })
  if (!response.ok) {
    throw new Error(`Failed to fetch Minecraft version manifest: ${response.status} ${response.statusText}`)
  }
  return response.json() as Promise<MojangManifest>
}

export async function getReleaseVersions(): Promise<MinecraftReleaseVersion[]> {
  const manifest = await fetchManifest()
  return manifest.versions
    .filter((entry) => entry.type === 'release')
    .sort((a, b) => Date.parse(b.releaseTime) - Date.parse(a.releaseTime))
    .map((entry) => ({ id: entry.id, releaseTime: entry.releaseTime }))
}

export async function getServerDownload(versionId: string): Promise<ServerDownloadInfo> {
  const manifest = await fetchManifest()
  const entry = manifest.versions.find((v) => v.id === versionId)
  if (!entry) {
    throw new Error(`Unknown Minecraft version: ${versionId}`)
  }

  const detailResponse = await fetch(entry.url, { headers: REQUEST_HEADERS })
  if (!detailResponse.ok) {
    throw new Error(`Failed to fetch version details for ${versionId}: ${detailResponse.status}`)
  }
  const detail = (await detailResponse.json()) as MojangVersionDetail

  if (!detail.downloads.server) {
    throw new Error(`Minecraft ${versionId} has no server download (client-only release).`)
  }

  return detail.downloads.server
}
