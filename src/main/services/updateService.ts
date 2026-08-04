import { autoUpdater } from 'electron-updater'
import type { UpdateStatus } from '@shared/updater'

autoUpdater.autoDownload = false

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
  autoUpdater.quitAndInstall()
}
