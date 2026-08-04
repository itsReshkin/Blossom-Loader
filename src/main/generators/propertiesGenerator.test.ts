import { describe, expect, it } from 'vitest'
import { initialWizardAnswers, type WizardAnswers } from '@shared/wizardConfig'
import { generateServerProperties } from './propertiesGenerator'

function makeAnswers(overrides: Partial<WizardAnswers> = {}): WizardAnswers {
  return { ...initialWizardAnswers, ...overrides }
}

describe('generateServerProperties', () => {
  it('renders answered values as key=value lines', () => {
    const output = generateServerProperties(
      makeAnswers({
        serverIdentity: { ...initialWizardAnswers.serverIdentity, motd: 'Hello World', maxPlayers: 42 }
      })
    )

    expect(output).toContain('motd=Hello World')
    expect(output).toContain('max-players=42')
  })

  it('falls back to sensible defaults for unanswered fields', () => {
    const output = generateServerProperties(makeAnswers({ serverIdentity: {} }))
    expect(output).toContain('motd=A Minecraft Server')
    expect(output).toContain('max-players=20')
  })

  it('maps world type to the minecraft namespaced level-type', () => {
    const output = generateServerProperties(
      makeAnswers({ worldSettings: { ...initialWizardAnswers.worldSettings, worldType: 'large_biomes' } })
    )
    expect(output).toContain('level-type=minecraft:large_biomes')
  })
})
