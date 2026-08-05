import { describe, expect, it } from 'vitest'
import { buildJvmFlags } from './jvmFlags'

describe('buildJvmFlags', () => {
  it('sets both heap bounds to the requested size', () => {
    const flags = buildJvmFlags(4)
    expect(flags).toContain('-Xms4G')
    expect(flags).toContain('-Xmx4G')
  })

  it('always enables G1GC', () => {
    expect(buildJvmFlags(4)).toContain('-XX:+UseG1GC')
  })

  it('uses the small-heap region sizing below 12 GB', () => {
    const flags = buildJvmFlags(8)
    expect(flags).toContain('-XX:G1NewSizePercent=30')
    expect(flags).toContain('-XX:G1HeapRegionSize=8M')
  })

  it('uses the large-heap region sizing from 12 GB up', () => {
    const flags = buildJvmFlags(12)
    expect(flags).toContain('-XX:G1NewSizePercent=40')
    expect(flags).toContain('-XX:G1HeapRegionSize=16M')
  })

  it('never emits a flag twice', () => {
    const flags = buildJvmFlags(16)
    expect(new Set(flags).size).toBe(flags.length)
  })
})
