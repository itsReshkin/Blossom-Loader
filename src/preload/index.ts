import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannel } from '@shared/ipcChannels'
import type { DownloadPluginParams, DownloadProgressEvent, DownloadedFileResult } from '@shared/downloads'
import type { GenerateProjectParams, GenerateProjectResult } from '@shared/generate'
import type { InstallProgressEvent } from '@shared/installProgress'
import type { PrerequisitesCheckResult } from '@shared/prerequisites'
import type { PluginSearchParams, PluginSearchResult } from '@shared/pluginSearch'
import type { UpdateStatus } from '@shared/updater'
import type { SaveTemplateParams, ServerTemplate } from '@shared/templates'
import type { LocalNetworkAddress, PortCheckResult, SystemMemoryInfo } from '@shared/systemInfo'
import type { RegisteredServer, RegisterServerParams } from '@shared/servers'

const api = {
  getAppVersion: (): Promise<string> => ipcRenderer.invoke(IpcChannel.AppGetVersion),
  selectDirectory: (): Promise<string | null> => ipcRenderer.invoke(IpcChannel.DialogSelectDirectory),
  getDefaultProjectsDirectory: (): Promise<string> =>
    ipcRenderer.invoke(IpcChannel.AppGetDefaultProjectsDirectory),
  getMinecraftReleaseVersions: (): Promise<string[]> =>
    ipcRenderer.invoke(IpcChannel.MinecraftGetReleaseVersions),
  getPaperSupportedVersions: (): Promise<string[]> =>
    ipcRenderer.invoke(IpcChannel.PaperGetSupportedVersions),
  downloadPlugin: (params: DownloadPluginParams): Promise<DownloadedFileResult> =>
    ipcRenderer.invoke(IpcChannel.DownloadPlugin, params),
  onDownloadProgress: (callback: (progress: DownloadProgressEvent) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, progress: DownloadProgressEvent) =>
      callback(progress)
    ipcRenderer.on(IpcChannel.DownloadProgress, listener)
    return () => ipcRenderer.removeListener(IpcChannel.DownloadProgress, listener)
  },
  generateProject: (params: GenerateProjectParams): Promise<GenerateProjectResult> =>
    ipcRenderer.invoke(IpcChannel.GenerateProject, params),
  onGenerateProgress: (callback: (progress: InstallProgressEvent) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, progress: InstallProgressEvent) => callback(progress)
    ipcRenderer.on(IpcChannel.GenerateProgress, listener)
    return () => ipcRenderer.removeListener(IpcChannel.GenerateProgress, listener)
  },
  showItemInFolder: (path: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.ShellShowItemInFolder, path),
  checkPrerequisites: (): Promise<PrerequisitesCheckResult> =>
    ipcRenderer.invoke(IpcChannel.CheckPrerequisites),
  searchPlugins: (params: PluginSearchParams): Promise<PluginSearchResult> =>
    ipcRenderer.invoke(IpcChannel.SearchPlugins, params),
  downloadJava: (): Promise<void> => ipcRenderer.invoke(IpcChannel.DownloadJava),
  checkForUpdates: (): Promise<void> => ipcRenderer.invoke(IpcChannel.UpdateCheck),
  downloadUpdate: (): Promise<void> => ipcRenderer.invoke(IpcChannel.UpdateDownload),
  installUpdate: (): Promise<void> => ipcRenderer.invoke(IpcChannel.UpdateInstall),
  onUpdateStatus: (callback: (status: UpdateStatus) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, status: UpdateStatus) => callback(status)
    ipcRenderer.on(IpcChannel.UpdateStatus, listener)
    return () => ipcRenderer.removeListener(IpcChannel.UpdateStatus, listener)
  },
  listTemplates: (): Promise<ServerTemplate[]> => ipcRenderer.invoke(IpcChannel.TemplatesList),
  saveTemplate: (params: SaveTemplateParams): Promise<ServerTemplate> =>
    ipcRenderer.invoke(IpcChannel.TemplatesSave, params),
  deleteTemplate: (id: string): Promise<void> => ipcRenderer.invoke(IpcChannel.TemplatesDelete, id),
  listServers: (): Promise<RegisteredServer[]> => ipcRenderer.invoke(IpcChannel.ServersList),
  registerServer: (params: RegisterServerParams): Promise<RegisteredServer> =>
    ipcRenderer.invoke(IpcChannel.ServersRegister, params),
  unregisterServer: (id: string): Promise<void> => ipcRenderer.invoke(IpcChannel.ServersUnregister, id),
  getMemoryInfo: (): Promise<SystemMemoryInfo> => ipcRenderer.invoke(IpcChannel.SystemGetMemory),
  checkPort: (port: number): Promise<PortCheckResult> => ipcRenderer.invoke(IpcChannel.SystemCheckPort, port),
  getLocalNetworkAddresses: (): Promise<LocalNetworkAddress[]> =>
    ipcRenderer.invoke(IpcChannel.SystemGetLocalAddresses)
}

contextBridge.exposeInMainWorld('blossom', api)

export type BlossomApi = typeof api
