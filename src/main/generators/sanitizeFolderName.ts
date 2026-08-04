export function sanitizeFolderName(name: string): string {
  const cleaned = name
    .trim()
    // eslint-disable-next-line no-control-regex -- stripping ASCII control chars is intentional here
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 50)
  return cleaned || 'Minecraft Server'
}

/**
 * Strips path separators and traversal segments from a file name sourced from
 * an external service or the OS file picker, so it can't escape its target folder.
 */
export function sanitizeFileName(name: string): string {
  const cleaned = name
    .trim()
    // eslint-disable-next-line no-control-regex -- stripping ASCII control chars is intentional here
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .slice(0, 200)
  return cleaned || 'file.jar'
}
