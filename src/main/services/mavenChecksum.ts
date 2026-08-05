import { REQUEST_HEADERS } from '../core/userAgent'

export async function fetchSha1Sidecar(jarUrl: string): Promise<string | null> {
  const response = await fetch(`${jarUrl}.sha1`, { headers: REQUEST_HEADERS })
  if (!response.ok) return null
  const text = await response.text()
  const match = text.trim().match(/^[a-f0-9]{40}/i)
  return match ? match[0] : null
}
