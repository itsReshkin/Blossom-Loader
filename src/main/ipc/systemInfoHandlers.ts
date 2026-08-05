import { ipcMain } from 'electron'
import { z } from 'zod'
import { IpcChannel } from '@shared/ipcChannels'
import { checkPort, getLocalNetworkAddresses, getMemoryInfo } from '../services/systemInfoService'

const PortSchema = z.coerce.number().int().min(1).max(65535)

export function registerSystemInfoHandlers(): void {
  ipcMain.handle(IpcChannel.SystemGetMemory, () => getMemoryInfo())
  ipcMain.handle(IpcChannel.SystemCheckPort, (_event, rawPort) => checkPort(PortSchema.parse(rawPort)))
  ipcMain.handle(IpcChannel.SystemGetLocalAddresses, () => getLocalNetworkAddresses())
}
