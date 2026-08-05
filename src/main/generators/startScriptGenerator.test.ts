import { describe, expect, it } from 'vitest'
import { generateStartScriptBat, generateStartScriptSh } from './startScriptGenerator'

const LAUNCH = 'java -Xmx4G -jar "server.jar" nogui'

describe('generateStartScriptBat', () => {
  it('checks for Java before launching', () => {
    const script = generateStartScriptBat({ launchCommand: LAUNCH, autoRestart: true })
    expect(script).toContain('where java')
    expect(script).toContain('adoptium.net')
    // The check has to come first, otherwise the loop starts before it runs.
    expect(script.indexOf('where java')).toBeLessThan(script.indexOf(':start'))
  })

  it('puts the bundled runtime on PATH when the machine has no Java', () => {
    const script = generateStartScriptBat({
      launchCommand: LAUNCH,
      autoRestart: false,
      portableJavaBinDir: 'C:\\cache\\java-runtime\\bin'
    })
    expect(script).toContain('set "PATH=C:\\cache\\java-runtime\\bin;%PATH%"')
    expect(script.indexOf('PATH=')).toBeLessThan(script.indexOf('where java'))
  })

  it('omits the PATH line when system Java is used', () => {
    const script = generateStartScriptBat({ launchCommand: LAUNCH, autoRestart: false })
    expect(script).not.toContain('set "PATH=')
  })

  // A server that cannot start used to restart every five seconds forever.
  it('caps consecutive restarts instead of looping forever', () => {
    const script = generateStartScriptBat({ launchCommand: LAUNCH, autoRestart: true })
    expect(script).toContain('set /a attempts+=1')
    expect(script).toMatch(/if %attempts% GEQ \d+/)
    expect(script).toContain('exit /b 1')
  })

  it('does not loop at all when auto-restart is off', () => {
    const script = generateStartScriptBat({ launchCommand: LAUNCH, autoRestart: false })
    expect(script).not.toContain('goto start')
    expect(script).toContain(LAUNCH)
  })

  // Without this, launching from a shortcut or another directory fails to find server.jar.
  it('switches to its own directory first', () => {
    const script = generateStartScriptBat({ launchCommand: LAUNCH, autoRestart: true })
    expect(script).toContain('cd /d "%~dp0"')
    expect(script.indexOf('cd /d')).toBeLessThan(script.indexOf(LAUNCH))
  })

  it('uses CRLF line endings', () => {
    const script = generateStartScriptBat({ launchCommand: LAUNCH, autoRestart: true })
    expect(script).toContain('\r\n')
    expect(script.split('\n').every((line) => line === '' || line.endsWith('\r'))).toBe(true)
  })
})

describe('generateStartScriptSh', () => {
  it('checks for Java before launching', () => {
    const script = generateStartScriptSh({ launchCommand: LAUNCH, autoRestart: true })
    expect(script).toContain('command -v java')
    expect(script.indexOf('command -v java')).toBeLessThan(script.indexOf('while true'))
  })

  it('never references the Windows runtime path', () => {
    const script = generateStartScriptSh({ launchCommand: LAUNCH, autoRestart: true })
    expect(script).not.toContain('java-runtime')
  })

  it('caps consecutive restarts', () => {
    const script = generateStartScriptSh({ launchCommand: LAUNCH, autoRestart: true })
    expect(script).toMatch(/-ge \d+/)
    expect(script).toContain('exit 1')
  })

  it('switches to its own directory first', () => {
    const script = generateStartScriptSh({ launchCommand: LAUNCH, autoRestart: true })
    expect(script).toContain('cd "$(dirname "$0")"')
  })

  it('starts with a shebang and uses LF only', () => {
    const script = generateStartScriptSh({ launchCommand: LAUNCH, autoRestart: false })
    expect(script.startsWith('#!/bin/sh')).toBe(true)
    expect(script).not.toContain('\r')
  })
})
