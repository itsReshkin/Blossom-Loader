import { Socket } from 'net'
import { networkInterfaces, totalmem } from 'os'
import type { LocalNetworkAddress, PortCheckResult, SystemMemoryInfo } from '@shared/systemInfo'

const BYTES_PER_GB = 1024 ** 3
/** Leave this much for the OS and everything else the user is running. */
const RESERVED_HOST_GB = 2
const PORT_PROBE_TIMEOUT_MS = 1000

export function getMemoryInfo(): SystemMemoryInfo {
  const totalGB = Math.floor(totalmem() / BYTES_PER_GB)
  return { totalGB, recommendedMaxGB: Math.max(1, totalGB - RESERVED_HOST_GB) }
}

/**
 * Probes the port by connecting to it rather than binding it. Binding would need the wildcard
 * address to notice a server listening on 0.0.0.0 — a loopback bind succeeds alongside one — and
 * a wildcard bind triggers the Windows firewall prompt. An outbound connection avoids both.
 *
 * A refused connection means nothing is listening. Anything else (a timeout, an unreachable
 * stack) is treated as available so an inconclusive probe never blocks the user.
 */
export function checkPort(port: number): Promise<PortCheckResult> {
  return new Promise((resolve) => {
    const socket = new Socket()
    const finish = (available: boolean) => {
      clearTimeout(timer)
      socket.removeAllListeners()
      socket.destroy()
      resolve({ port, available })
    }

    const timer = setTimeout(() => finish(true), PORT_PROBE_TIMEOUT_MS)

    socket.once('connect', () => finish(false))
    socket.once('error', () => finish(true))
    socket.connect(port, '127.0.0.1')
  })
}

export function getLocalNetworkAddresses(): LocalNetworkAddress[] {
  const addresses: LocalNetworkAddress[] = []

  for (const [interfaceName, infos] of Object.entries(networkInterfaces())) {
    for (const info of infos ?? []) {
      if (info.family === 'IPv4' && !info.internal) {
        addresses.push({ address: info.address, interfaceName })
      }
    }
  }

  return addresses
}
