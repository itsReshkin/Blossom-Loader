import { z } from 'zod'
import { SERVER_SOFTWARE_IDS } from './serverSoftware'

export interface DownloadedFileResult {
  filePath: string
  fileName: string
}

export interface DownloadProgressEvent {
  bytesReceived: number
  totalBytes: number
}

export interface DownloadPluginParams {
  slug: string
  loader: (typeof SERVER_SOFTWARE_IDS)[number]
  minecraftVersion: string
}

export const DownloadPluginParamsSchema = z.object({
  slug: z.string().min(1),
  loader: z.enum(SERVER_SOFTWARE_IDS),
  minecraftVersion: z.string().min(1)
})
