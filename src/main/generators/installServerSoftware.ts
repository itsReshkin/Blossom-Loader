import { existsSync } from 'fs'
import { copyFile, mkdir, readdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import type { InstallProgressEvent } from '@shared/installProgress'
import type { ServerSoftwareId } from '@shared/serverSoftware'
import { getServerDownload as getVanillaDownload } from '../services/mojangService'
import { getLatestBuildDownload as getPaperDownload } from '../services/paperService'
import {
  getLatestStableLoaderVersion,
  getLatestInstaller as getFabricInstaller
} from '../services/fabricService'
import { getRecommendedForgeVersion, getInstallerUrl as getForgeInstallerUrl } from '../services/forgeService'
import { BUILD_TOOLS_URL } from '../services/spigotService'
import {
  checkGitAvailable,
  checkSystemJavaAvailable,
  downloadPortableJava,
  getPortableJavaExecutable,
  isPortableJavaInstalled
} from '../services/javaService'
import { fetchSha1Sidecar } from '../services/mavenChecksum'
import { downloadFile } from '../services/downloadService'
import { runProcess } from '../services/processRunner'
import { buildJvmFlags } from './jvmFlags'

export interface InstallServerSoftwareParams {
  softwareId: ServerSoftwareId
  minecraftVersion: string
  projectPath: string
  memoryGB: number
  cacheRoot: string
  onProgress: (event: InstallProgressEvent) => void
}

export interface InstallServerSoftwareResult {
  windowsLaunchCommand: string
  unixLaunchCommand: string
  /**
   * Directory holding the Java runtime Blossom downloaded, or null when the machine already has a
   * usable `java` on PATH. The generated start script prepends it so plain `java` resolves — which
   * also covers Forge, whose own run.bat invokes `java` directly.
   */
  portableJavaBinDir: string | null
}

/** What an individual installer produces; the Java runtime is resolved once, above them. */
type InstalledLaunchCommands = Omit<InstallServerSoftwareResult, 'portableJavaBinDir'>

interface SoftwareContext {
  minecraftVersion: string
  projectPath: string
  memoryGB: number
  cacheRoot: string
  onProgress: (event: InstallProgressEvent) => void
}

interface JavaSoftwareContext extends SoftwareContext {
  /** The `java` command to spawn locally for installers/BuildTools — system `java` or a
   * downloaded portable runtime's absolute path. Generated start scripts still say plain `java`;
   * they get the runtime through a PATH entry instead, so the scripts stay portable. */
  javaCommand: string
}

const LOG_THROTTLE_MS = 150

function throttledLogger(onProgress: (event: InstallProgressEvent) => void): (line: string) => void {
  let lastSent = 0
  return (line: string) => {
    const now = Date.now()
    if (now - lastSent >= LOG_THROTTLE_MS) {
      lastSent = now
      onProgress({ kind: 'log', line })
    }
  }
}

function genericLaunchCommand(jarName: string, memoryGB: number): string {
  return `java ${buildJvmFlags(memoryGB).join(' ')} -jar "${jarName}" nogui`
}

/**
 * Makes sure a Java runtime exists before the server is generated, downloading a portable one when
 * the machine has none. The generated server needs Java to run, not just the installers do, so this
 * runs for every server software — otherwise start.bat fails with "java is not recognized".
 */
async function ensureJavaRuntime(
  cacheRoot: string,
  onProgress: (event: InstallProgressEvent) => void
): Promise<{ javaCommand: string; portableJavaBinDir: string | null }> {
  const system = await checkSystemJavaAvailable()
  if (system.available) return { javaCommand: 'java', portableJavaBinDir: null }

  if (!isPortableJavaInstalled(cacheRoot)) {
    onProgress({ kind: 'status', message: 'No Java found on this machine. Downloading a runtime...' })
    await downloadPortableJava(cacheRoot, (progress) =>
      onProgress({ kind: 'download', label: 'Java runtime', ...progress })
    )
  }

  const javaCommand = getPortableJavaExecutable(cacheRoot)
  return { javaCommand, portableJavaBinDir: dirname(javaCommand) }
}

async function installVanilla(ctx: SoftwareContext): Promise<InstalledLaunchCommands> {
  const { minecraftVersion, projectPath, memoryGB, cacheRoot, onProgress } = ctx
  onProgress({ kind: 'status', message: 'Fetching Minecraft server download info...' })
  const info = await getVanillaDownload(minecraftVersion)
  const dest = join(cacheRoot, 'server-jars', `vanilla-${minecraftVersion}.jar`)

  if (!existsSync(dest)) {
    await downloadFile(info.url, dest, { algorithm: 'sha1', value: info.sha1 }, (progress) =>
      onProgress({ kind: 'download', label: `Minecraft ${minecraftVersion}`, ...progress })
    )
  }

  await copyFile(dest, join(projectPath, 'server.jar'))
  const command = genericLaunchCommand('server.jar', memoryGB)
  return { windowsLaunchCommand: command, unixLaunchCommand: command }
}

async function installPaper(ctx: SoftwareContext): Promise<InstalledLaunchCommands> {
  const { minecraftVersion, projectPath, memoryGB, cacheRoot, onProgress } = ctx
  onProgress({ kind: 'status', message: 'Fetching Paper build info...' })
  const info = await getPaperDownload(minecraftVersion)
  const dest = join(cacheRoot, 'server-jars', info.filename)

  if (!existsSync(dest)) {
    await downloadFile(info.url, dest, { algorithm: 'sha256', value: info.sha256 }, (progress) =>
      onProgress({ kind: 'download', label: `Paper ${minecraftVersion}`, ...progress })
    )
  }

  await copyFile(dest, join(projectPath, 'server.jar'))
  const command = genericLaunchCommand('server.jar', memoryGB)
  return { windowsLaunchCommand: command, unixLaunchCommand: command }
}

async function installFabric(ctx: JavaSoftwareContext): Promise<InstalledLaunchCommands> {
  const { minecraftVersion, projectPath, memoryGB, cacheRoot, javaCommand, onProgress } = ctx
  onProgress({ kind: 'status', message: 'Resolving Fabric loader version...' })
  const loaderVersion = await getLatestStableLoaderVersion(minecraftVersion)
  const installerInfo = await getFabricInstaller()

  const installerPath = join(cacheRoot, 'installers', `fabric-installer-${installerInfo.version}.jar`)
  if (!existsSync(installerPath)) {
    onProgress({ kind: 'status', message: 'Downloading Fabric installer...' })
    const sha1 = await fetchSha1Sidecar(installerInfo.url)
    await downloadFile(
      installerInfo.url,
      installerPath,
      sha1 ? { algorithm: 'sha1', value: sha1 } : null,
      (progress) => onProgress({ kind: 'download', label: 'Fabric installer', ...progress })
    )
  }

  onProgress({ kind: 'status', message: 'Installing Fabric server...' })
  await runProcess(
    javaCommand,
    [
      '-jar',
      installerPath,
      'server',
      '-mcversion',
      minecraftVersion,
      '-loader',
      loaderVersion,
      '-downloadMinecraft',
      '-dir',
      projectPath
    ],
    { cwd: projectPath, onLine: throttledLogger(onProgress) }
  )

  const command = genericLaunchCommand('fabric-server-launch.jar', memoryGB)
  return { windowsLaunchCommand: command, unixLaunchCommand: command }
}

async function patchForgeMemoryArgs(projectPath: string, memoryGB: number): Promise<void> {
  const argsPath = join(projectPath, 'user_jvm_args.txt')
  if (!existsSync(argsPath)) return

  // Forge reads JVM args from this file rather than the start script, so the tuning goes here.
  // Drop any flag we are about to set so re-running never produces duplicates.
  const managedFlags = buildJvmFlags(memoryGB)
  const managedPrefixes = managedFlags.map((flag) => flag.split('=')[0])
  const content = await readFile(argsPath, 'utf-8')
  const lines = content
    .split('\n')
    .filter((line) => !managedPrefixes.some((prefix) => line.trim().startsWith(prefix)))

  await writeFile(argsPath, [...lines, ...managedFlags].join('\n'), 'utf-8')
}

async function installForge(ctx: JavaSoftwareContext): Promise<InstalledLaunchCommands> {
  const { minecraftVersion, projectPath, memoryGB, cacheRoot, javaCommand, onProgress } = ctx
  onProgress({ kind: 'status', message: 'Resolving Forge version...' })
  const forgeVersion = await getRecommendedForgeVersion(minecraftVersion)
  const installerUrl = getForgeInstallerUrl(minecraftVersion, forgeVersion)

  const installerPath = join(
    cacheRoot,
    'installers',
    `forge-${minecraftVersion}-${forgeVersion}-installer.jar`
  )
  if (!existsSync(installerPath)) {
    onProgress({ kind: 'status', message: 'Downloading Forge installer...' })
    const sha1 = await fetchSha1Sidecar(installerUrl)
    await downloadFile(
      installerUrl,
      installerPath,
      sha1 ? { algorithm: 'sha1', value: sha1 } : null,
      (progress) => onProgress({ kind: 'download', label: 'Forge installer', ...progress })
    )
  }

  onProgress({
    kind: 'status',
    message: 'Installing Forge server (this patches every Minecraft class, it takes a minute)...'
  })
  await runProcess(javaCommand, ['-jar', installerPath, '--installServer', projectPath], {
    cwd: projectPath,
    onLine: throttledLogger(onProgress)
  })

  await patchForgeMemoryArgs(projectPath, memoryGB)

  return {
    windowsLaunchCommand: 'call run.bat nogui',
    unixLaunchCommand: 'sh run.sh nogui'
  }
}

async function installSpigot(ctx: JavaSoftwareContext): Promise<InstalledLaunchCommands> {
  const { minecraftVersion, projectPath, memoryGB, cacheRoot, javaCommand, onProgress } = ctx
  const gitCheck = await checkGitAvailable()
  if (!gitCheck.available) {
    throw new Error('Git is required to build Spigot but was not found. Install Git and try again.')
  }

  const buildDir = join(cacheRoot, 'spigot-build', minecraftVersion)
  await mkdir(buildDir, { recursive: true })

  const buildToolsPath = join(buildDir, 'BuildTools.jar')
  if (!existsSync(buildToolsPath)) {
    onProgress({ kind: 'status', message: 'Downloading BuildTools...' })
    await downloadFile(BUILD_TOOLS_URL, buildToolsPath, null, (progress) =>
      onProgress({ kind: 'download', label: 'BuildTools', ...progress })
    )
  }

  onProgress({
    kind: 'status',
    message: 'Building Spigot from source (this compiles Minecraft and can take 5-15 minutes)...'
  })
  await runProcess(javaCommand, ['-jar', 'BuildTools.jar', '--rev', minecraftVersion], {
    cwd: buildDir,
    // BuildTools clones several deeply nested Java source trees. On Windows, without
    // core.longpaths=true, Git silently fails to write files whose full path exceeds the 260
    // character MAX_PATH limit ("Filename too long") — the checkout then looks "dirty" relative
    // to the patch baseline because some files never got written, and patch application fails.
    // core.autocrlf=false avoids a separate, unrelated line-ending mismatch on some forked repos.
    // Overriding these for this process only avoids touching the user's global Git config.
    env: {
      GIT_CONFIG_COUNT: '2',
      GIT_CONFIG_KEY_0: 'core.autocrlf',
      GIT_CONFIG_VALUE_0: 'false',
      GIT_CONFIG_KEY_1: 'core.longpaths',
      GIT_CONFIG_VALUE_1: 'true'
    },
    onLine: throttledLogger(onProgress)
  })

  const builtFiles = await readdir(buildDir)
  const spigotJar = builtFiles.find((name) => name.startsWith('spigot-') && name.endsWith('.jar'))
  if (!spigotJar) {
    throw new Error('BuildTools finished but no spigot-*.jar was produced. Check the build log for errors.')
  }

  await copyFile(join(buildDir, spigotJar), join(projectPath, 'server.jar'))
  const command = genericLaunchCommand('server.jar', memoryGB)
  return { windowsLaunchCommand: command, unixLaunchCommand: command }
}

export async function installServerSoftware(
  params: InstallServerSoftwareParams
): Promise<InstallServerSoftwareResult> {
  const { softwareId } = params

  const { javaCommand, portableJavaBinDir } = await ensureJavaRuntime(params.cacheRoot, (event) =>
    params.onProgress(event)
  )

  const result = await installWith(softwareId, { ...params, javaCommand })
  return { ...result, portableJavaBinDir }
}

async function installWith(
  softwareId: ServerSoftwareId,
  javaCtx: JavaSoftwareContext
): Promise<Omit<InstallServerSoftwareResult, 'portableJavaBinDir'>> {
  switch (softwareId) {
    case 'vanilla':
      return installVanilla(javaCtx)
    case 'paper':
      return installPaper(javaCtx)
    case 'fabric':
      return installFabric(javaCtx)
    case 'forge':
      return installForge(javaCtx)
    case 'spigot':
      return installSpigot(javaCtx)
    default:
      throw new Error(`Unknown server software: ${softwareId as string}`)
  }
}
