import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { readdir, rename, rm } from 'fs/promises'
import { join } from 'path'
import { parseJavaFeatureVersion } from '@shared/minecraftJava'
import { getLatestPortableJre } from './adoptiumService'
import { extractZip } from './archiveService'
import { downloadFile, type DownloadProgress } from './downloadService'

export interface JavaCheckResult {
  available: boolean
  version?: string
}

function checkCommandAvailable(
  command: string,
  versionArgs: string[],
  versionPattern: RegExp
): Promise<JavaCheckResult> {
  return new Promise((resolve) => {
    let proc
    try {
      proc = spawn(command, versionArgs)
    } catch {
      resolve({ available: false })
      return
    }

    let output = ''
    proc.stdout?.on('data', (chunk: Buffer) => {
      output += chunk.toString()
    })
    proc.stderr?.on('data', (chunk: Buffer) => {
      output += chunk.toString()
    })
    proc.on('error', () => resolve({ available: false }))
    proc.on('close', (code) => {
      if (code !== 0) {
        resolve({ available: false })
        return
      }
      const match = output.match(versionPattern)
      resolve({ available: true, version: match?.[1] })
    })
  })
}

export function checkSystemJavaAvailable(): Promise<JavaCheckResult> {
  return checkCommandAvailable('java', ['-version'], /version "([^"]+)"/)
}

export function checkGitAvailable(): Promise<JavaCheckResult> {
  return checkCommandAvailable('git', ['--version'], /git version ([\w.]+)/)
}

/** Runtimes are kept per feature version, since different Minecraft releases need different ones. */
export function getPortableJavaExecutable(cacheRoot: string, featureVersion: number): string {
  return join(cacheRoot, `java-runtime-${featureVersion}`, 'bin', 'java.exe')
}

export function isPortableJavaInstalled(cacheRoot: string, featureVersion: number): boolean {
  return existsSync(getPortableJavaExecutable(cacheRoot, featureVersion))
}

/** True when the system Java is present and new enough for the given requirement. */
export async function isSystemJavaSufficient(requiredFeatureVersion: number): Promise<boolean> {
  const system = await checkSystemJavaAvailable()
  if (!system.available || !system.version) return false

  const feature = parseJavaFeatureVersion(system.version)
  return feature !== null && feature >= requiredFeatureVersion
}

export async function checkJavaAvailable(
  cacheRoot: string,
  requiredFeatureVersion: number
): Promise<JavaCheckResult> {
  const system = await checkSystemJavaAvailable()
  if (system.available && system.version) {
    const feature = parseJavaFeatureVersion(system.version)
    if (feature !== null && feature >= requiredFeatureVersion) return system
  }
  return { available: isPortableJavaInstalled(cacheRoot, requiredFeatureVersion) }
}

export async function downloadPortableJava(
  cacheRoot: string,
  featureVersion: number,
  onProgress?: (progress: DownloadProgress) => void
): Promise<string> {
  const info = await getLatestPortableJre(featureVersion)
  const zipPath = join(cacheRoot, 'downloads', info.filename)

  if (!existsSync(zipPath)) {
    await downloadFile(info.url, zipPath, { algorithm: 'sha256', value: info.sha256 }, onProgress)
  }

  const extractDir = join(cacheRoot, `java-extract-tmp-${featureVersion}`)
  await rm(extractDir, { recursive: true, force: true })
  await extractZip(zipPath, extractDir)

  const entries = await readdir(extractDir, { withFileTypes: true })
  const jreFolder = entries.find((entry) => entry.isDirectory())
  if (!jreFolder) {
    throw new Error('Downloaded Java runtime archive had an unexpected layout.')
  }

  const finalDir = join(cacheRoot, `java-runtime-${featureVersion}`)
  await rm(finalDir, { recursive: true, force: true })
  await rename(join(extractDir, jreFolder.name), finalDir)
  await rm(extractDir, { recursive: true, force: true })

  const javaExe = getPortableJavaExecutable(cacheRoot, featureVersion)
  if (!existsSync(javaExe)) {
    throw new Error(`Java ${featureVersion} runtime was extracted but java.exe was not found.`)
  }
  return javaExe
}
