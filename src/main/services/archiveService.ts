import { mkdir } from 'fs/promises'
import { join } from 'path'
import { runProcess } from './processRunner'

function escapeForPowerShellSingleQuoted(value: string): string {
  return value.replace(/'/g, "''")
}

// Resolved via SystemRoot rather than relying on `powershell.exe` being found through PATH
// lookup, which behaves inconsistently depending on how the parent process itself was launched.
function getPowerShellPath(): string {
  const systemRoot = process.env.SystemRoot ?? process.env.windir ?? 'C:\\Windows'
  return join(systemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
}

export async function extractZip(zipPath: string, destinationDir: string): Promise<void> {
  // `cwd` must exist before spawn() will launch the child process at all — Expand-Archive would
  // otherwise create destinationDir itself, but spawn() checks cwd first and fails with a
  // misleading ENOENT on the executable path if it doesn't exist yet.
  await mkdir(destinationDir, { recursive: true })

  const safeZipPath = escapeForPowerShellSingleQuoted(zipPath)
  const safeDestDir = escapeForPowerShellSingleQuoted(destinationDir)

  await runProcess(
    getPowerShellPath(),
    [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      `Expand-Archive -LiteralPath '${safeZipPath}' -DestinationPath '${safeDestDir}' -Force`
    ],
    { cwd: destinationDir }
  )
}
