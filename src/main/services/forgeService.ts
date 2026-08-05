import { REQUEST_HEADERS } from '../core/userAgent'

const FORGE_PROMOTIONS_URL = 'https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json'

interface PromotionsResponse {
  promos: Record<string, string>
}

export async function getRecommendedForgeVersion(mcVersion: string): Promise<string> {
  const response = await fetch(FORGE_PROMOTIONS_URL, { headers: REQUEST_HEADERS })
  if (!response.ok) {
    throw new Error('Failed to fetch Forge version list.')
  }
  const data = (await response.json()) as PromotionsResponse
  const version = data.promos[`${mcVersion}-recommended`] ?? data.promos[`${mcVersion}-latest`]
  if (!version) {
    throw new Error(`Forge has no build for Minecraft ${mcVersion}.`)
  }
  return version
}

export function getInstallerUrl(mcVersion: string, forgeVersion: string): string {
  const fullVersion = `${mcVersion}-${forgeVersion}`
  return `https://maven.minecraftforge.net/net/minecraftforge/forge/${fullVersion}/forge-${fullVersion}-installer.jar`
}
