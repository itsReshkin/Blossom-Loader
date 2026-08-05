import { copyFile, mkdir, rm, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join, resolve, sep } from 'path'
import { SERVER_SOFTWARE_CATALOG } from '@shared/serverSoftware'
import type { ServerSoftwareId } from '@shared/serverSoftware'
import type { WizardAnswers } from '@shared/wizardConfig'
import type { AddonFile, GenerateProjectParams, GenerateProjectResult } from '@shared/generate'
import type { InstallProgressEvent } from '@shared/installProgress'
import { generateServerProperties } from './propertiesGenerator'
import { generateEula } from './eulaGenerator'
import { generateStartScriptBat, generateStartScriptSh } from './startScriptGenerator'
import { generateReadme } from './readmeGenerator'
import { sanitizeFileName, sanitizeFolderName } from './sanitizeFolderName'
import { installServerSoftware } from './installServerSoftware'
import { generateOpsJson, generateWhitelistJson } from './playerFilesGenerator'
import { resolveProfiles } from '../services/playerProfileService'

export type { GenerateProjectParams, GenerateProjectResult }

const ADDON_FOLDER_BY_SOFTWARE: Record<string, 'plugins' | 'mods'> = {
  paper: 'plugins',
  spigot: 'plugins',
  fabric: 'mods',
  forge: 'mods'
}

export interface GenerateProjectOptions {
  cacheRoot: string
  onProgress?: (event: InstallProgressEvent) => void
}

export async function generateProject(
  params: GenerateProjectParams,
  options: GenerateProjectOptions
): Promise<GenerateProjectResult> {
  const { answers, eulaAccepted, pluginFiles = [] } = params
  const { cacheRoot, onProgress } = options

  if (!eulaAccepted) {
    throw new Error('You must accept the Minecraft EULA before a server can be generated.')
  }

  const projectName = answers.projectBasics.projectName
  const installDirectory = answers.projectBasics.installDirectory
  const softwareId = answers.serverSoftware.softwareId
  const minecraftVersion = answers.serverSoftware.minecraftVersion
  if (!projectName || !installDirectory || !softwareId || !minecraftVersion) {
    throw new Error('Project basics or server software are incomplete.')
  }

  const folderName = sanitizeFolderName(projectName)
  const installRoot = resolve(installDirectory)
  const projectPath = resolve(installRoot, folderName)

  if (!(projectPath + sep).startsWith(installRoot + sep)) {
    throw new Error('Invalid install directory.')
  }

  // Only a folder we created ourselves may be removed on failure — never one the user already had.
  const existedBeforehand = existsSync(projectPath)
  try {
    return await writeProject({
      answers,
      eulaAccepted,
      pluginFiles,
      folderName,
      projectPath,
      softwareId,
      minecraftVersion,
      cacheRoot,
      onProgress
    })
  } catch (error) {
    if (!existedBeforehand) {
      await rm(projectPath, { recursive: true, force: true }).catch(() => undefined)
    }
    throw error
  }
}

interface WriteProjectContext {
  answers: WizardAnswers
  eulaAccepted: boolean
  pluginFiles: AddonFile[]
  folderName: string
  projectPath: string
  softwareId: ServerSoftwareId
  minecraftVersion: string
  cacheRoot: string
  onProgress?: (event: InstallProgressEvent) => void
}

async function writeProject(ctx: WriteProjectContext): Promise<GenerateProjectResult> {
  const {
    answers,
    eulaAccepted,
    pluginFiles,
    folderName,
    projectPath,
    softwareId,
    minecraftVersion,
    cacheRoot,
    onProgress
  } = ctx

  await mkdir(projectPath, { recursive: true })

  const memoryGB = answers.performance.memoryGB ?? 4
  const autoRestart = answers.performance.autoRestart ?? true

  const { windowsLaunchCommand, unixLaunchCommand } = await installServerSoftware({
    softwareId,
    minecraftVersion,
    projectPath,
    memoryGB,
    cacheRoot,
    onProgress: (event) => onProgress?.(event)
  })

  const addonFolder = ADDON_FOLDER_BY_SOFTWARE[softwareId]

  if (pluginFiles.length > 0 && addonFolder) {
    const addonPath = join(projectPath, addonFolder)
    await mkdir(addonPath, { recursive: true })
    await Promise.all(
      pluginFiles.map((file) => copyFile(file.filePath, join(addonPath, sanitizeFileName(file.fileName))))
    )
  }

  const installedAddons = answers.plugins.selected.map((entry) => ({
    name: entry.name,
    folder: addonFolder ?? ('plugins' as const)
  }))

  const software = SERVER_SOFTWARE_CATALOG.find((entry) => entry.id === softwareId)

  const playerEntries = answers.players.entries
  let playerFileWrites: Promise<void>[] = []

  if (playerEntries.length > 0) {
    onProgress?.({ kind: 'status', message: 'Looking up player accounts...' })
    const onlineMode = answers.networking.onlineMode ?? true
    const profiles = await resolveProfiles(
      playerEntries.map((entry) => entry.username),
      onlineMode
    )
    const operatorNames = new Set(
      playerEntries.filter((entry) => entry.isOperator).map((entry) => entry.username.toLowerCase())
    )
    const operators = profiles.filter((profile) => operatorNames.has(profile.name.toLowerCase()))

    playerFileWrites = [
      writeFile(join(projectPath, 'whitelist.json'), generateWhitelistJson(profiles), 'utf-8'),
      writeFile(join(projectPath, 'ops.json'), generateOpsJson(operators), 'utf-8')
    ]
  }

  onProgress?.({ kind: 'status', message: 'Writing server configuration...' })

  await Promise.all([
    ...playerFileWrites,
    writeFile(join(projectPath, 'eula.txt'), generateEula(eulaAccepted), 'utf-8'),
    writeFile(join(projectPath, 'server.properties'), generateServerProperties(answers), 'utf-8'),
    writeFile(
      join(projectPath, 'start.bat'),
      generateStartScriptBat(windowsLaunchCommand, autoRestart),
      'utf-8'
    ),
    writeFile(join(projectPath, 'start.sh'), generateStartScriptSh(unixLaunchCommand, autoRestart), 'utf-8'),
    writeFile(
      join(projectPath, 'README.md'),
      generateReadme({
        projectName: folderName,
        softwareName: software?.name ?? 'Minecraft',
        minecraftVersion,
        serverPort: answers.networking.serverPort ?? 25565,
        installedAddons
      }),
      'utf-8'
    )
  ])

  return { projectPath }
}
