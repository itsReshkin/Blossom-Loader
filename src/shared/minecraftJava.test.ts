import { describe, expect, it } from 'vitest'
import { NEWEST_KNOWN_JAVA, parseJavaFeatureVersion, requiredJavaVersion } from './minecraftJava'

describe('requiredJavaVersion', () => {
  it('maps legacy releases', () => {
    expect(requiredJavaVersion('1.8.9')).toBe(8)
    expect(requiredJavaVersion('1.16.5')).toBe(8)
    expect(requiredJavaVersion('1.17')).toBe(16)
    expect(requiredJavaVersion('1.17.1')).toBe(16)
    expect(requiredJavaVersion('1.18.2')).toBe(17)
    expect(requiredJavaVersion('1.19.4')).toBe(17)
  })

  // The requirement changed inside 1.20, not at a minor boundary.
  it('handles the 1.20.5 boundary', () => {
    expect(requiredJavaVersion('1.20.4')).toBe(17)
    expect(requiredJavaVersion('1.20.5')).toBe(21)
    expect(requiredJavaVersion('1.20.6')).toBe(21)
  })

  it('maps 1.21 to Java 21', () => {
    expect(requiredJavaVersion('1.21')).toBe(21)
    expect(requiredJavaVersion('1.21.4')).toBe(21)
  })

  // This is the case that broke: a release under the new scheme needing Java 25.
  it('maps the new versioning scheme to the newest requirement', () => {
    expect(requiredJavaVersion('26.1')).toBe(NEWEST_KNOWN_JAVA)
    expect(requiredJavaVersion('26.1.2')).toBe(NEWEST_KNOWN_JAVA)
    expect(requiredJavaVersion('27.0')).toBe(NEWEST_KNOWN_JAVA)
  })

  it('assumes the newest requirement for anything it cannot read', () => {
    expect(requiredJavaVersion('not-a-version')).toBe(NEWEST_KNOWN_JAVA)
    expect(requiredJavaVersion('')).toBe(NEWEST_KNOWN_JAVA)
  })
})

describe('parseJavaFeatureVersion', () => {
  it('reads modern version strings', () => {
    expect(parseJavaFeatureVersion('21.0.9')).toBe(21)
    expect(parseJavaFeatureVersion('25')).toBe(25)
    expect(parseJavaFeatureVersion('17.0.10')).toBe(17)
  })

  it('reads the legacy 1.x form', () => {
    expect(parseJavaFeatureVersion('1.8.0_402')).toBe(8)
  })

  it('returns null when there is no version to read', () => {
    expect(parseJavaFeatureVersion('unknown')).toBeNull()
    expect(parseJavaFeatureVersion('1')).toBeNull()
  })
})
