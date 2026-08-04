import { describe, expect, it } from 'vitest'
import { sanitizeFileName, sanitizeFolderName } from './sanitizeFolderName'

describe('sanitizeFolderName', () => {
  it('strips path separators and control characters', () => {
    expect(sanitizeFolderName('../../etc/passwd')).toBe('....etcpasswd')
    expect(sanitizeFolderName('My:Server*Name?')).toBe('MyServerName')
  })

  it('collapses whitespace and trims', () => {
    expect(sanitizeFolderName('  My   Server  ')).toBe('My Server')
  })

  it('falls back to a default name when empty after cleaning', () => {
    expect(sanitizeFolderName('///')).toBe('Minecraft Server')
    expect(sanitizeFolderName('   ')).toBe('Minecraft Server')
  })

  it('truncates to 50 characters', () => {
    const long = 'a'.repeat(100)
    expect(sanitizeFolderName(long)).toHaveLength(50)
  })
})

describe('sanitizeFileName', () => {
  it('removes traversal segments and separators', () => {
    expect(sanitizeFileName('../../evil.jar')).toBe('....evil.jar')
    expect(sanitizeFileName('sub/dir\\file.jar')).toBe('subdirfile.jar')
  })

  it('falls back to a default file name when empty after cleaning', () => {
    expect(sanitizeFileName('///')).toBe('file.jar')
  })

  it('truncates to 200 characters', () => {
    const long = 'a'.repeat(300)
    expect(sanitizeFileName(long)).toHaveLength(200)
  })
})
