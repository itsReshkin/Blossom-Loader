import { app, BrowserWindow, ipcMain } from 'electron'
import { existsSync } from 'fs'
import { join } from 'path'
import { IpcChannel } from '@shared/ipcChannels'
import { DownloadPluginParamsSchema } from '@shared/downloads'
import type { DownloadedFileResult } from '@shared/downloads'
import { LOADER_CATEGORIES_BY_SOFTWARE, PluginSearchParamsSchema } from '@shared/pluginSearch'
import { getReleaseVersions } from '../services/mojangService'
import { getSupportedVersions } from '../services/paperService'
import { getVersionDownload, searchProjects } from '../services/modrinthService'
import { downloadFile } from '../services/downloadService'
import { sanitizeFileName } from '../generators/sanitizeFolderName'

export function registerDownloadHandlers(): void {
  ipcMain.handle(IpcChannel.MinecraftGetReleaseVersions, async () => {
    const versions = await getReleaseVersions()
    return versions.map((version) => version.id)
  })

  ipcMain.handle(IpcChannel.PaperGetSupportedVersions, async () => {
    return getSupportedVersions()
  })

  ipcMain.handle(IpcChannel.DownloadPlugin, async (event, rawParams) => {
    const params = DownloadPluginParamsSchema.parse(rawParams)
    const window = BrowserWindow.fromWebContents(event.sender)
    const cacheDir = join(app.getPath('userData'), 'cache', 'plugins')

    const info = await getVersionDownload(params.slug, params.loader, params.minecraftVersion)
    const fileName = sanitizeFileName(info.filename)
    const filePath = join(cacheDir, fileName)
    const result: DownloadedFileResult = { filePath, fileName }

    if (existsSync(filePath)) {
      return result
    }

    await downloadFile(info.url, filePath, { algorithm: 'sha1', value: info.sha1 }, (progress) => {
      window?.webContents.send(IpcChannel.DownloadProgress, progress)
    })

    return result
  })

  ipcMain.handle(IpcChannel.SearchPlugins, async (_event, rawParams) => {
    const params = PluginSearchParamsSchema.parse(rawParams)
    const loaderCategories = LOADER_CATEGORIES_BY_SOFTWARE[params.softwareId] ?? []
    if (loaderCategories.length === 0) {
      return { hits: [], totalHits: 0 }
    }
    return searchProjects({
      query: params.query,
      loaderCategories,
      gameVersion: params.minecraftVersion,
      offset: params.offset,
      limit: 20
    })
  })
}
