// electron-updater is CommonJS; a named import breaks in the packaged ESM build.
import electronUpdater from 'electron-updater'
import type { UpdateStatus } from '@shared/updater'

const { autoUpdater } = electronUpdater

autoUpdater.autoDownload = false
// We ship a normal NSIS installer, not a web installer. Opting out silences the deprecation
// warning and keeps behaviour stable when this flips to true in a future electron-updater.
autoUpdater.disableWebInstaller = true

// electron-updater only reports whether it reused local blocks instead of refetching the whole
// installer when a logger is attached, so route it to the main process console.
autoUpdater.logger = {
  info: (message) => console.log('[updater]', message),
  warn: (message) => console.warn('[updater]', message),
  error: (message) => console.error('[updater]', message),
  debug: (message) => console.log('[updater:debug]', message)
}

export function initUpdateService(onStatus: (status: UpdateStatus) => void): void {
  autoUpdater.on('checking-for-update', () => onStatus({ state: 'checking' }))
  autoUpdater.on('update-available', (info) => onStatus({ state: 'available', version: info.version }))
  autoUpdater.on('update-not-available', () => onStatus({ state: 'not-available' }))
  autoUpdater.on('download-progress', (progress) =>
    onStatus({ state: 'downloading', percent: Math.round(progress.percent) })
  )
  autoUpdater.on('update-downloaded', (info) => onStatus({ state: 'downloaded', version: info.version }))
  autoUpdater.on('error', (error) => onStatus({ state: 'error', message: error.message }))
}

export async function checkForUpdates(): Promise<void> {
  await autoUpdater.checkForUpdates()
}

export async function downloadUpdate(): Promise<void> {
  await autoUpdater.downloadUpdate()
}

export function quitAndInstall(): void {
  // isSilent: run the NSIS installer without its wizard — the install directory is already known
  // from the existing installation, so there is nothing to ask. Without this the user has to click
  // through the full setup assistant on every update.
  // isForceRunAfter: relaunch afterwards, which a silent install does not do on its own.
  autoUpdater.quitAndInstall(true, true)
}
