import { createServer, type Server } from 'net'
import { afterEach, describe, expect, it } from 'vitest'
import { checkPort, getLocalNetworkAddresses, getMemoryInfo } from './systemInfoService'

const PROBE_PORT = 28764
let holder: Server | null = null

afterEach(async () => {
  if (holder) {
    await new Promise((resolve) => holder?.close(resolve))
    holder = null
  }
})

function listenOn(port: number, host: string): Promise<Server> {
  return new Promise((resolve) => {
    const server = createServer()
    server.listen(port, host, () => resolve(server))
  })
}

describe('checkPort', () => {
  it('reports a free port as available', async () => {
    expect(await checkPort(PROBE_PORT)).toEqual({ port: PROBE_PORT, available: true })
  })

  // A Minecraft server binds the wildcard address, so this is the case that actually matters.
  it('detects a server listening on 0.0.0.0', async () => {
    holder = await listenOn(PROBE_PORT, '0.0.0.0')
    expect(await checkPort(PROBE_PORT)).toEqual({ port: PROBE_PORT, available: false })
  })

  it('detects a server listening on loopback only', async () => {
    holder = await listenOn(PROBE_PORT, '127.0.0.1')
    expect(await checkPort(PROBE_PORT)).toEqual({ port: PROBE_PORT, available: false })
  })
})

describe('getMemoryInfo', () => {
  it('reports a positive total and leaves headroom for the host', () => {
    const info = getMemoryInfo()
    expect(info.totalGB).toBeGreaterThan(0)
    expect(info.recommendedMaxGB).toBeGreaterThanOrEqual(1)
    expect(info.recommendedMaxGB).toBeLessThanOrEqual(info.totalGB)
  })
})

describe('getLocalNetworkAddresses', () => {
  it('never returns loopback or internal interfaces', () => {
    for (const entry of getLocalNetworkAddresses()) {
      expect(entry.address).not.toBe('127.0.0.1')
      expect(entry.address).toMatch(/^\d+\.\d+\.\d+\.\d+$/)
    }
  })
})
