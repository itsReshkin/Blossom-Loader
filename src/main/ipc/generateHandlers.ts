import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { z } from 'zod'
import { IpcChannel } from '@shared/ipcChannels'
import { GenerateProjectParamsSchema } from '@shared/generate'
import { requiredJavaVersion } from '@shared/minecraftJava'
import type { PrerequisitesCheckResult } from '@shared/prerequisites'
import { generateProject } from '../generators/projectGenerator'
import { checkGitAvailable, checkJavaAvailable, downloadPortableJava } from '../services/javaService'

const MinecraftVersionSchema = z.string().trim().min(1).max(64)

function getCacheRoot(): string {
  return join(app.getPath('userData'), 'cache')
}

export function registerGenerateHandlers(): void {
  ipcMain.handle(IpcChannel.GenerateProject, async (event, rawParams) => {
    const params = GenerateProjectParamsSchema.parse(rawParams)
    const window = BrowserWindow.fromWebContents(event.sender)
    return generateProject(params, {
      cacheRoot: getCacheRoot(),
      onProgress: (progress) => {
        window?.webContents.send(IpcChannel.GenerateProgress, progress)
      }
    })
  })

  ipcMain.handle(
    IpcChannel.CheckPrerequisites,
    async (_event, rawVersion): Promise<PrerequisitesCheckResult> => {
      // The Java requirement depends on the selected Minecraft version, so the check needs it.
      const minecraftVersion = MinecraftVersionSchema.parse(rawVersion)
      const requiredJava = requiredJavaVersion(minecraftVersion)
      const [java, git] = await Promise.all([
        checkJavaAvailable(getCacheRoot(), requiredJava),
        checkGitAvailable()
      ])
      return { java, git, requiredJava }
    }
  )

  ipcMain.handle(IpcChannel.DownloadJava, async (event, rawVersion) => {
    const minecraftVersion = MinecraftVersionSchema.parse(rawVersion)
    const window = BrowserWindow.fromWebContents(event.sender)
    await downloadPortableJava(getCacheRoot(), requiredJavaVersion(minecraftVersion), (progress) => {
      window?.webContents.send(IpcChannel.DownloadProgress, progress)
    })
  })
}
