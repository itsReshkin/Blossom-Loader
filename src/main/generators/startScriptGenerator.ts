export interface StartScriptOptions {
  launchCommand: string
  autoRestart: boolean
  /** Prepended to PATH so plain `java` resolves when the machine has no system Java. */
  portableJavaBinDir?: string | null
}

/**
 * A server that cannot start at all used to restart forever, filling the console with the same
 * error every five seconds. Checking for Java up front catches by far the most common cause, and
 * capping consecutive restarts stops any other startup failure from spinning indefinitely.
 */
const MAX_CONSECUTIVE_RESTARTS = 5

const JAVA_MISSING_MESSAGE =
  'Java was not found. Install Java 21 or newer from https://adoptium.net and start this script again.'

export function generateStartScriptBat(options: StartScriptOptions): string {
  const { launchCommand, autoRestart, portableJavaBinDir } = options
  // Switch to the script's own folder so server.jar is found no matter where the script is
  // launched from — a shortcut, another drive, or a shell sitting in a different directory.
  const lines = ['@echo off', 'setlocal', 'cd /d "%~dp0"']

  if (portableJavaBinDir) {
    lines.push(`set "PATH=${portableJavaBinDir};%PATH%"`)
  }

  lines.push(
    'where java >nul 2>nul',
    'if errorlevel 1 (',
    `  echo ${JAVA_MISSING_MESSAGE}`,
    '  pause',
    '  exit /b 1',
    ')'
  )

  if (!autoRestart) {
    lines.push(launchCommand, 'pause')
    return `${lines.join('\r\n')}\r\n`
  }

  lines.push(
    'set /a attempts=0',
    ':start',
    launchCommand,
    'set /a attempts+=1',
    `if %attempts% GEQ ${MAX_CONSECUTIVE_RESTARTS} (`,
    `  echo Stopped after ${MAX_CONSECUTIVE_RESTARTS} restarts. Check the messages above for the cause.`,
    '  pause',
    '  exit /b 1',
    ')',
    'echo.',
    'echo Server stopped. Restarting in 5 seconds... Press Ctrl+C to cancel.',
    'timeout /t 5',
    'goto start'
  )

  return `${lines.join('\r\n')}\r\n`
}

export function generateStartScriptSh(options: StartScriptOptions): string {
  const { launchCommand, autoRestart } = options

  // Deliberately no PATH entry here: the portable runtime Blossom downloads is a Windows build,
  // so a Unix host has to provide its own Java.
  const preamble = [
    '#!/bin/sh',
    'cd "$(dirname "$0")" || exit 1',
    'if ! command -v java >/dev/null 2>&1; then',
    `  echo "${JAVA_MISSING_MESSAGE}"`,
    '  exit 1',
    'fi'
  ]

  if (!autoRestart) {
    return `${[...preamble, launchCommand].join('\n')}\n`
  }

  return `${[
    ...preamble,
    'attempts=0',
    'while true; do',
    `  ${launchCommand}`,
    '  attempts=$((attempts + 1))',
    `  if [ "$attempts" -ge ${MAX_CONSECUTIVE_RESTARTS} ]; then`,
    `    echo "Stopped after ${MAX_CONSECUTIVE_RESTARTS} restarts. Check the messages above for the cause."`,
    '    exit 1',
    '  fi',
    '  echo "Server stopped. Restarting in 5 seconds..."',
    '  sleep 5',
    'done'
  ].join('\n')}\n`
}
