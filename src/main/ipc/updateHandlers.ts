import { BrowserWindow, ipcMain } from 'electron'
import { IpcChannel } from '@shared/ipcChannels'
import type { UpdateStatus } from '@shared/updater'
import { checkForUpdates, downloadUpdate, initUpdateService, quitAndInstall } from '../services/updateService'

export function registerUpdateHandlers(): void {
  initUpdateService((status: UpdateStatus) => {
    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send(IpcChannel.UpdateStatus, status)
    }
  })

  ipcMain.handle(IpcChannel.UpdateCheck, () => checkForUpdates())
  ipcMain.handle(IpcChannel.UpdateDownload, () => downloadUpdate())
  ipcMain.handle(IpcChannel.UpdateInstall, () => quitAndInstall())
}
