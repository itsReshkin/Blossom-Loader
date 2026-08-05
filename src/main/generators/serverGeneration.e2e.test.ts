import { existsSync } from 'fs'
import { mkdtemp, readFile, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterAll, expect, it } from 'vitest'
import { initialWizardAnswers } from '@shared/wizardConfig'
import { generateProject } from './projectGenerator'

// Temporary end-to-end check: hits the real Paper and Mojang APIs and downloads a real server jar.
let workDir = ''

afterAll(async () => {
  if (workDir) await rm(workDir, { recursive: true, force: true })
})

it(
  'generates a complete, runnable Paper server',
  async () => {
    workDir = await mkdtemp(join(tmpdir(), 'blossom-e2e-'))
    const cacheRoot = join(workDir, 'cache')

    const result = await generateProject(
      {
        answers: {
          ...initialWizardAnswers,
          projectBasics: { projectName: 'E2E Test Server', installDirectory: workDir },
          serverSoftware: { softwareId: 'paper', minecraftVersion: '1.21.4' },
          serverIdentity: { ...initialWizardAnswers.serverIdentity, motd: 'E2E', whitelist: true },
          players: { entries: [{ username: 'Notch', isOperator: true }, { username: 'jeb_', isOperator: false }] }
        },
        eulaAccepted: true
      },
      { cacheRoot, onProgress: (event) => console.log('[progress]', JSON.stringify(event).slice(0, 120)) }
    )

    for (const file of [
      'server.jar',
      'server.properties',
      'eula.txt',
      'start.bat',
      'start.sh',
      'README.md',
      'ops.json',
      'whitelist.json'
    ]) {
      expect(existsSync(join(result.projectPath, file)), `${file} missing`).toBe(true)
    }

    const { statSync } = await import('fs')
    const jarBytes = statSync(join(result.projectPath, 'server.jar')).size
    console.log('[jar bytes]', jarBytes)
    expect(jarBytes).toBeGreaterThan(20_000_000)

    const startBat = await readFile(join(result.projectPath, 'start.bat'), 'utf-8')
    expect(startBat).toContain('-XX:+UseG1GC')
    console.log('[launch]', startBat.split('\n').find((line) => line.includes('java')))

    const ops = JSON.parse(await readFile(join(result.projectPath, 'ops.json'), 'utf-8'))
    const whitelist = JSON.parse(await readFile(join(result.projectPath, 'whitelist.json'), 'utf-8'))
    console.log('[ops]', JSON.stringify(ops))
    console.log('[whitelist]', JSON.stringify(whitelist))

    expect(ops).toHaveLength(1)
    expect(ops[0].name).toBe('Notch')
    expect(whitelist).toHaveLength(2)

    const properties = await readFile(join(result.projectPath, 'server.properties'), 'utf-8')
    expect(properties).toContain('white-list=true')
  },
  900000
)
