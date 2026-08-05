import { describe, expect, it } from 'vitest'
import { getOfflineUuid, resolveProfiles } from './playerProfileService'

describe('getOfflineUuid', () => {
  // b50ad385-829d-3141-a216-7e7d7539ba7f is the widely documented offline UUID for Notch, and
  // pins the whole derivation: any change to the hashing or the version/variant bits breaks it.
  it('matches the UUID a vanilla offline server derives', () => {
    expect(getOfflineUuid('Notch')).toBe('b50ad385-829d-3141-a216-7e7d7539ba7f')
  })

  it('produces a version 3 UUID', () => {
    expect(getOfflineUuid('Player')[14]).toBe('3')
  })

  it('sets the RFC 4122 variant bits', () => {
    expect(['8', '9', 'a', 'b']).toContain(getOfflineUuid('Player')[19])
  })

  it('is stable and case sensitive', () => {
    expect(getOfflineUuid('Notch')).toBe(getOfflineUuid('Notch'))
    expect(getOfflineUuid('Notch')).not.toBe(getOfflineUuid('notch'))
  })
})

describe('resolveProfiles', () => {
  it('derives UUIDs locally in offline mode without contacting Mojang', async () => {
    const profiles = await resolveProfiles(['Notch', 'jeb_'], false)
    expect(profiles).toEqual([
      { uuid: getOfflineUuid('Notch'), name: 'Notch' },
      { uuid: getOfflineUuid('jeb_'), name: 'jeb_' }
    ])
  })

  it('returns an empty list for no usernames', async () => {
    expect(await resolveProfiles([], false)).toEqual([])
  })
})
