export function generateStartScriptBat(launchCommand: string, autoRestart: boolean): string {
  if (!autoRestart) {
    return `@echo off\r\n${launchCommand}\r\npause\r\n`
  }

  return (
    '@echo off\r\n' +
    ':start\r\n' +
    `${launchCommand}\r\n` +
    'echo.\r\n' +
    'echo Server stopped. Restarting in 5 seconds... Press Ctrl+C to cancel.\r\n' +
    'timeout /t 5\r\n' +
    'goto start\r\n'
  )
}

export function generateStartScriptSh(launchCommand: string, autoRestart: boolean): string {
  if (!autoRestart) {
    return `#!/bin/sh\n${launchCommand}\n`
  }

  return (
    '#!/bin/sh\nwhile true; do\n' +
    `  ${launchCommand}\n` +
    '  echo "Server stopped. Restarting in 5 seconds..."\n' +
    '  sleep 5\n' +
    'done\n'
  )
}
