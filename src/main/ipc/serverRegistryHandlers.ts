import { app, ipcMain } from 'electron'
import { join } from 'path'
import { z } from 'zod'
import { IpcChannel } from '@shared/ipcChannels'
import { RegisterServerParamsSchema } from '@shared/servers'
import { listServers, registerServer, unregisterServer } from '../services/serverRegistryService'

function getRegistryPath(): string {
  return join(app.getPath('userData'), 'servers.json')
}

export function registerServerRegistryHandlers(): void {
  ipcMain.handle(IpcChannel.ServersList, () => listServers(getRegistryPath()))

  ipcMain.handle(IpcChannel.ServersRegister, (_event, rawParams) =>
    registerServer(getRegistryPath(), RegisterServerParamsSchema.parse(rawParams))
  )

  ipcMain.handle(IpcChannel.ServersUnregister, (_event, rawId) =>
    unregisterServer(getRegistryPath(), z.string().min(1).parse(rawId))
  )
}
