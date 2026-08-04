import { randomUUID } from 'crypto'
import { mkdir, readdir, readFile, rm, writeFile } from 'fs/promises'
import { join } from 'path'
import type { SaveTemplateParams, ServerTemplate } from '@shared/templates'

function templateFilePath(templatesDir: string, id: string): string {
  return join(templatesDir, `${id}.json`)
}

export async function listTemplates(templatesDir: string): Promise<ServerTemplate[]> {
  await mkdir(templatesDir, { recursive: true })
  const files = await readdir(templatesDir)
  const templates = await Promise.all(
    files
      .filter((file) => file.endsWith('.json'))
      .map(async (file) => JSON.parse(await readFile(join(templatesDir, file), 'utf-8')) as ServerTemplate)
  )
  return templates.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function saveTemplate(templatesDir: string, params: SaveTemplateParams): Promise<ServerTemplate> {
  await mkdir(templatesDir, { recursive: true })
  const template: ServerTemplate = {
    id: randomUUID(),
    name: params.name,
    createdAt: new Date().toISOString(),
    answers: params.answers
  }
  await writeFile(templateFilePath(templatesDir, template.id), JSON.stringify(template, null, 2), 'utf-8')
  return template
}

export async function deleteTemplate(templatesDir: string, id: string): Promise<void> {
  if (!/^[a-zA-Z0-9-]+$/.test(id)) {
    throw new Error('Invalid template id.')
  }
  await rm(templateFilePath(templatesDir, id), { force: true })
}
