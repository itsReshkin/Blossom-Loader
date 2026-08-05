import { describe, expect, it } from 'vitest'
import { generateOpsJson, generateWhitelistJson } from './playerFilesGenerator'

const profiles = [
  { uuid: 'b50ad385-829d-3141-a216-7e7d7539ba7f', name: 'Notch' },
  { uuid: 'a762f560-4fce-3236-812a-b80efff0b62b', name: 'jeb_' }
]

describe('generateWhitelistJson', () => {
  it('emits one uuid/name pair per player', () => {
    expect(JSON.parse(generateWhitelistJson(profiles))).toEqual([
      { uuid: 'b50ad385-829d-3141-a216-7e7d7539ba7f', name: 'Notch' },
      { uuid: 'a762f560-4fce-3236-812a-b80efff0b62b', name: 'jeb_' }
    ])
  })

  it('emits an empty array for no players', () => {
    expect(JSON.parse(generateWhitelistJson([]))).toEqual([])
  })
})

describe('generateOpsJson', () => {
  it('grants full operator level', () => {
    const [entry] = JSON.parse(generateOpsJson([profiles[0]]))
    expect(entry).toEqual({
      uuid: 'b50ad385-829d-3141-a216-7e7d7539ba7f',
      name: 'Notch',
      level: 4,
      bypassesPlayerLimit: false
    })
  })
})
