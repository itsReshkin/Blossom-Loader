import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { IpcChannel } from '@shared/ipcChannels'
import { GenerateProjectParamsSchema } from '@shared/generate'
import type { PrerequisitesCheckResult } from '@shared/prerequisites'
import { generateProject } from '../generators/projectGenerator'
import { checkGitAvailable, checkJavaAvailable, downloadPortableJava } from '../services/javaService'

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

  ipcMain.handle(IpcChannel.CheckPrerequisites, async (): Promise<PrerequisitesCheckResult> => {
    const cacheRoot = getCacheRoot()
    const [java, git] = await Promise.all([checkJavaAvailable(cacheRoot), checkGitAvailable()])
    return { java, git }
  })

  ipcMain.handle(IpcChannel.DownloadJava, async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    await downloadPortableJava(getCacheRoot(), (progress) => {
      window?.webContents.send(IpcChannel.DownloadProgress, progress)
    })
  })
}
