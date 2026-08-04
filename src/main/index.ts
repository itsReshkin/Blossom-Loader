import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { is } from './core/env'
import { IpcChannel } from '@shared/ipcChannels'
import { registerDialogHandlers } from './ipc/dialogHandlers'
import { registerDownloadHandlers } from './ipc/downloadHandlers'
import { registerGenerateHandlers } from './ipc/generateHandlers'
import { registerUpdateHandlers } from './ipc/updateHandlers'
import { registerTemplateHandlers } from './ipc/templateHandlers'
import { checkForUpdates } from './services/updateService'

function createMainWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0b0d10',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0b0d10',
      symbolColor: '#e6e8eb',
      height: 40
    },
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  if (is.dev) {
    mainWindow.webContents.on('console-message', (event) => {
      console.log(`[renderer] ${event.message} (${event.sourceId}:${event.lineNumber})`)
    })
  }

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  ipcMain.handle(IpcChannel.AppGetVersion, () => app.getVersion())
  registerDialogHandlers()
  registerDownloadHandlers()
  registerGenerateHandlers()
  registerUpdateHandlers()
  registerTemplateHandlers()

  createMainWindow()

  if (app.isPackaged) {
    checkForUpdates().catch((error) => console.error('Update check failed:', error))
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
