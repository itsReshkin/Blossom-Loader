import { spawn } from 'child_process'

export interface RunProcessOptions {
  cwd: string
  env?: Record<string, string>
  onLine?: (line: string) => void
}

export function runProcess(command: string, args: string[], options: RunProcessOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    let proc
    try {
      proc = spawn(command, args, {
        cwd: options.cwd,
        env: options.env ? { ...process.env, ...options.env } : process.env
      })
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)))
      return
    }

    const forward = (chunk: Buffer): void => {
      const text = chunk.toString()
      for (const line of text.split(/\r?\n/)) {
        if (line.length > 0) options.onLine?.(line)
      }
    }

    proc.stdout?.on('data', forward)
    proc.stderr?.on('data', forward)
    proc.on('error', reject)
    proc.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} exited with code ${code}`))
    })
  })
}
