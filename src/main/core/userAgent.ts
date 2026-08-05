import { version } from '../../../package.json'

/**
 * Sent with every outbound API request. Several of the upstream APIs (Modrinth in particular) ask
 * callers to identify themselves. Derived from package.json so a release bump can never leave a
 * stale version behind in nine separate service files.
 */
export const USER_AGENT = `Blossom/${version} (Minecraft server creation wizard)`

export const REQUEST_HEADERS = { 'User-Agent': USER_AGENT }
