import { describe, expect, it } from 'vitest'
import { resolveProjectPath } from './resolveProjectPath'

describe('resolveProjectPath', () => {
  it('places the folder inside a normal directory', () => {
    const { projectPath } = resolveProjectPath('C:\\Servers', 'My Server')
    expect(projectPath).toBe('C:\\Servers\\My Server')
  })

  // The prefix comparison this replaced appended a separator to the install root, which turned a
  // drive root into "D:\\" and rejected every path under it. This is what users actually hit.
  it('accepts a drive root as the install directory', () => {
    expect(resolveProjectPath('D:\\', 'My Server').projectPath).toBe('D:\\My Server')
    expect(resolveProjectPath('C:\\', 'My Server').projectPath).toBe('C:\\My Server')
  })

  it('accepts a directory written with a trailing separator', () => {
    expect(resolveProjectPath('C:\\Servers\\', 'My Server').projectPath).toBe('C:\\Servers\\My Server')
  })

  it('does not confuse a sibling directory with the install root', () => {
    // "C:\Servers2\X" must never count as living inside "C:\Servers".
    const { projectPath, installRoot } = resolveProjectPath('C:\\Servers', 'X')
    expect(projectPath.startsWith(installRoot + '\\')).toBe(true)
    expect(resolveProjectPath('C:\\Servers2', 'X').projectPath).toBe('C:\\Servers2\\X')
  })

  it('rejects a name that would climb out of the install directory', () => {
    // sanitizeFolderName strips separators but keeps dots, so ".." must be caught here.
    expect(() => resolveProjectPath('C:\\Servers', '..')).toThrow(/outside/)
  })

  it('sanitizes the folder name', () => {
    expect(resolveProjectPath('C:\\Servers', 'My:Server*?').folderName).toBe('MyServer')
  })

  it('falls back to a default name when nothing usable is left', () => {
    expect(resolveProjectPath('C:\\Servers', '///').folderName).toBe('Minecraft Server')
  })
})
