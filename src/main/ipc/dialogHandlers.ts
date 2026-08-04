import { app, dialog, ipcMain, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { IpcChannel } from '@shared/ipcChannels'

export function registerDialogHandlers(): void {
  ipcMain.handle(IpcChannel.DialogSelectDirectory, async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return null

    const result = await dialog.showOpenDialog(window, {
      properties: ['openDirectory', 'createDirectory']
    })

    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  ipcMain.handle(IpcChannel.AppGetDefaultProjectsDirectory, () => {
    return join(app.getPath('documents'), 'Blossom Servers')
  })

  ipcMain.handle(IpcChannel.ShellShowItemInFolder, (_event, path: string) => {
    shell.showItemInFolder(path)
  })
}
