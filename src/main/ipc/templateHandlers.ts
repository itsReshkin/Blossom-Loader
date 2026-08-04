import { app, ipcMain } from 'electron'
import { join } from 'path'
import { IpcChannel } from '@shared/ipcChannels'
import { SaveTemplateParamsSchema } from '@shared/templates'
import { deleteTemplate, listTemplates, saveTemplate } from '../services/templateService'

function getTemplatesDir(): string {
  return join(app.getPath('userData'), 'templates')
}

export function registerTemplateHandlers(): void {
  ipcMain.handle(IpcChannel.TemplatesList, () => listTemplates(getTemplatesDir()))

  ipcMain.handle(IpcChannel.TemplatesSave, (_event, rawParams) => {
    const params = SaveTemplateParamsSchema.parse(rawParams)
    return saveTemplate(getTemplatesDir(), params)
  })

  ipcMain.handle(IpcChannel.TemplatesDelete, (_event, id: string) => deleteTemplate(getTemplatesDir(), id))
}
