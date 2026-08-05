import type { PlayerProfile } from '../services/playerProfileService'

/** Full operator level — all commands, including stop and op. */
const OPERATOR_LEVEL = 4

export function generateWhitelistJson(profiles: PlayerProfile[]): string {
  const entries = profiles.map((profile) => ({ uuid: profile.uuid, name: profile.name }))
  return `${JSON.stringify(entries, null, 2)}\n`
}

export function generateOpsJson(profiles: PlayerProfile[]): string {
  const entries = profiles.map((profile) => ({
    uuid: profile.uuid,
    name: profile.name,
    level: OPERATOR_LEVEL,
    bypassesPlayerLimit: false
  }))
  return `${JSON.stringify(entries, null, 2)}\n`
}
