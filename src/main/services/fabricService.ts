import { REQUEST_HEADERS } from '../core/userAgent'

const FABRIC_META_BASE = 'https://meta.fabricmc.net/v2'

interface FabricLoaderEntry {
  loader: { version: string; stable: boolean }
}

interface FabricInstallerEntry {
  url: string
  version: string
  stable: boolean
}

export async function getLatestStableLoaderVersion(mcVersion: string): Promise<string> {
  const response = await fetch(`${FABRIC_META_BASE}/versions/loader/${mcVersion}`, {
    headers: REQUEST_HEADERS
  })
  if (!response.ok) {
    throw new Error(`Fabric has no loader builds for Minecraft ${mcVersion}.`)
  }
  const entries = (await response.json()) as FabricLoaderEntry[]
  const chosen = entries.find((entry) => entry.loader.stable) ?? entries[0]
  if (!chosen) {
    throw new Error(`Fabric has no loader builds for Minecraft ${mcVersion}.`)
  }
  return chosen.loader.version
}

export interface FabricInstallerInfo {
  url: string
  version: string
}

export async function getLatestInstaller(): Promise<FabricInstallerInfo> {
  const response = await fetch(`${FABRIC_META_BASE}/versions/installer`, { headers: REQUEST_HEADERS })
  if (!response.ok) {
    throw new Error('Failed to fetch Fabric installer versions.')
  }
  const entries = (await response.json()) as FabricInstallerEntry[]
  const chosen = entries.find((entry) => entry.stable) ?? entries[0]
  if (!chosen) {
    throw new Error('No Fabric installer build is available.')
  }
  return { url: chosen.url, version: chosen.version }
}
