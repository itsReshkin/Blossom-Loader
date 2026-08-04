import { describe, expect, it } from 'vitest'
import { ProjectBasicsSchema, ServerIdentitySchema, ServerSoftwareSelectionSchema } from './wizardConfig'

describe('ProjectBasicsSchema', () => {
  it('accepts a valid project name and directory', () => {
    const result = ProjectBasicsSchema.safeParse({ projectName: 'My Server 1', installDirectory: 'C:\\Servers' })
    expect(result.success).toBe(true)
  })

  it('rejects names with path separators or traversal characters', () => {
    expect(ProjectBasicsSchema.safeParse({ projectName: '../evil', installDirectory: 'C:\\Servers' }).success).toBe(
      false
    )
    expect(ProjectBasicsSchema.safeParse({ projectName: 'a/b', installDirectory: 'C:\\Servers' }).success).toBe(false)
  })

  it('rejects an empty install directory', () => {
    expect(ProjectBasicsSchema.safeParse({ projectName: 'Server', installDirectory: '' }).success).toBe(false)
  })
})

describe('ServerSoftwareSelectionSchema', () => {
  it('only accepts known software ids', () => {
    expect(
      ServerSoftwareSelectionSchema.safeParse({ softwareId: 'paper', minecraftVersion: '1.21' }).success
    ).toBe(true)
    expect(
      ServerSoftwareSelectionSchema.safeParse({ softwareId: 'not-real', minecraftVersion: '1.21' }).success
    ).toBe(false)
  })
})

describe('ServerIdentitySchema', () => {
  it('rejects an out-of-range player count', () => {
    const base = { motd: 'Hi', difficulty: 'easy', gamemode: 'survival', hardcore: false, pvp: true, whitelist: false }
    expect(ServerIdentitySchema.safeParse({ ...base, maxPlayers: 0 }).success).toBe(false)
    expect(ServerIdentitySchema.safeParse({ ...base, maxPlayers: 201 }).success).toBe(false)
    expect(ServerIdentitySchema.safeParse({ ...base, maxPlayers: 20 }).success).toBe(true)
  })
})
