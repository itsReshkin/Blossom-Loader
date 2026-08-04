import { z } from 'zod'
import { SERVER_SOFTWARE_IDS } from './serverSoftware'
import type { ServerSoftwareId } from './serverSoftware'

export const LOADER_CATEGORIES_BY_SOFTWARE: Partial<Record<ServerSoftwareId, string[]>> = {
  paper: ['paper', 'spigot'],
  spigot: ['spigot'],
  fabric: ['fabric'],
  forge: ['forge']
}

export interface PluginSearchParams {
  query: string
  softwareId: ServerSoftwareId
  minecraftVersion: string
  offset: number
}

export const PluginSearchParamsSchema = z.object({
  query: z.string().max(200),
  softwareId: z.enum(SERVER_SOFTWARE_IDS),
  minecraftVersion: z.string().min(1),
  offset: z.coerce.number().int().min(0).max(1000)
})

export interface PluginSearchHit {
  slug: string
  name: string
  description: string
  iconUrl: string | null
  downloads: number
}

export interface PluginSearchResult {
  hits: PluginSearchHit[]
  totalHits: number
}
