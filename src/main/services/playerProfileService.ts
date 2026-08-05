import { createHash } from 'crypto'

const PROFILE_URL = 'https://api.mojang.com/users/profiles/minecraft'
const REQUEST_HEADERS = { 'User-Agent': 'Blossom/0.1.0 (Minecraft server creation wizard)' }

export interface PlayerProfile {
  uuid: string
  name: string
}

function formatUuid(hex: string): string {
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20, 32)].join('-')
}

/**
 * Offline servers derive UUIDs locally instead of asking Mojang: a version 3 (MD5) UUID over
 * the bytes of `OfflinePlayer:<name>`. Using an online UUID on an offline server — or the
 * reverse — produces entries the server never matches, which silently locks players out.
 */
export function getOfflineUuid(username: string): string {
  const hash = createHash('md5').update(`OfflinePlayer:${username}`, 'utf8').digest()
  hash[6] = (hash[6] & 0x0f) | 0x30
  hash[8] = (hash[8] & 0x3f) | 0x80
  return formatUuid(hash.toString('hex'))
}

async function fetchOnlineProfile(username: string): Promise<PlayerProfile | null> {
  const response = await fetch(`${PROFILE_URL}/${encodeURIComponent(username)}`, {
    headers: REQUEST_HEADERS
  })

  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error(`Could not reach Mojang to look up "${username}": ${response.status}`)
  }

  const profile = (await response.json()) as { id: string; name: string }
  return { uuid: formatUuid(profile.id), name: profile.name }
}

/**
 * Resolves every username to the UUID the server will actually see. Unknown names are reported
 * together so the user can fix all typos at once instead of one generation attempt per mistake.
 */
export async function resolveProfiles(usernames: string[], onlineMode: boolean): Promise<PlayerProfile[]> {
  if (!onlineMode) {
    return usernames.map((username) => ({ uuid: getOfflineUuid(username), name: username }))
  }

  const results = await Promise.all(
    usernames.map(async (username) => ({ username, profile: await fetchOnlineProfile(username) }))
  )

  const unknown = results.filter((entry) => entry.profile === null).map((entry) => entry.username)
  if (unknown.length > 0) {
    throw new Error(
      `These names do not exist as Minecraft accounts: ${unknown.join(', ')}. Fix the spelling, remove them, or turn off Online Mode.`
    )
  }

  return results.map((entry) => entry.profile as PlayerProfile)
}
