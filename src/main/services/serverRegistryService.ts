import { randomUUID } from 'crypto'
import { existsSync } from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname } from 'path'
import { RegisteredServerSchema } from '@shared/servers'
import type { RegisteredServer, RegisterServerParams } from '@shared/servers'

async function readRegistry(registryPath: string): Promise<RegisteredServer[]> {
  if (!existsSync(registryPath)) return []

  try {
    const parsed = JSON.parse(await readFile(registryPath, 'utf-8'))
    // Drop entries that no longer match the schema rather than failing the whole list.
    return RegisteredServerSchema.array().parse(parsed)
  } catch {
    return []
  }
}

async function writeRegistry(registryPath: string, servers: RegisteredServer[]): Promise<void> {
  await mkdir(dirname(registryPath), { recursive: true })
  await writeFile(registryPath, JSON.stringify(servers, null, 2), 'utf-8')
}

/** Registered servers, newest first, with entries whose folder was deleted filtered out. */
export async function listServers(registryPath: string): Promise<RegisteredServer[]> {
  const servers = await readRegistry(registryPath)
  const existing = servers.filter((server) => existsSync(server.path))

  if (existing.length !== servers.length) {
    await writeRegistry(registryPath, existing)
  }

  return existing.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function registerServer(
  registryPath: string,
  params: RegisterServerParams
): Promise<RegisteredServer> {
  const servers = await readRegistry(registryPath)
  const server: RegisteredServer = { ...params, id: randomUUID(), createdAt: new Date().toISOString() }

  // Regenerating into the same folder replaces the old entry instead of duplicating it.
  const withoutSamePath = servers.filter((entry) => entry.path !== params.path)
  await writeRegistry(registryPath, [...withoutSamePath, server])

  return server
}

export async function unregisterServer(registryPath: string, id: string): Promise<void> {
  const servers = await readRegistry(registryPath)
  await writeRegistry(
    registryPath,
    servers.filter((server) => server.id !== id)
  )
}
