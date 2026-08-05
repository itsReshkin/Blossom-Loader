import { mkdtemp, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { listServers, registerServer, unregisterServer } from './serverRegistryService'

let workDir: string
let registryPath: string

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), 'blossom-registry-'))
  registryPath = join(workDir, 'servers.json')
})

afterEach(async () => {
  await rm(workDir, { recursive: true, force: true })
})

function serverParams(overrides: Partial<Parameters<typeof registerServer>[1]> = {}) {
  return {
    name: 'Test Server',
    path: workDir,
    softwareId: 'paper' as const,
    minecraftVersion: '1.21',
    serverPort: 25565,
    ...overrides
  }
}

describe('serverRegistryService', () => {
  it('returns an empty list when no registry exists yet', async () => {
    expect(await listServers(registryPath)).toEqual([])
  })

  it('registers a server and reads it back', async () => {
    const registered = await registerServer(registryPath, serverParams())
    const servers = await listServers(registryPath)

    expect(servers).toHaveLength(1)
    expect(servers[0].id).toBe(registered.id)
    expect(servers[0].name).toBe('Test Server')
  })

  it('replaces the existing entry when registering the same path twice', async () => {
    await registerServer(registryPath, serverParams({ name: 'First' }))
    await registerServer(registryPath, serverParams({ name: 'Second' }))

    const servers = await listServers(registryPath)
    expect(servers).toHaveLength(1)
    expect(servers[0].name).toBe('Second')
  })

  it('drops entries whose folder no longer exists', async () => {
    await registerServer(registryPath, serverParams({ path: join(workDir, 'deleted-later') }))
    expect(await listServers(registryPath)).toEqual([])
  })

  it('unregisters by id', async () => {
    const registered = await registerServer(registryPath, serverParams())
    await unregisterServer(registryPath, registered.id)
    expect(await listServers(registryPath)).toEqual([])
  })

  it('recovers from a corrupted registry file instead of throwing', async () => {
    await writeFile(registryPath, 'not json at all', 'utf-8')
    expect(await listServers(registryPath)).toEqual([])
  })
})
