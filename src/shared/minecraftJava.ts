/**
 * Which Java feature version a Minecraft server release needs.
 *
 * Minecraft raised this requirement several times, and running a version on too old a Java fails
 * at startup with a message from the server itself. Picking a fixed Java version for every release
 * therefore cannot work.
 */

/** Highest requirement we know about; also the fallback for releases newer than this table. */
export const NEWEST_KNOWN_JAVA = 25

const LEGACY_DEFAULT_JAVA = 8

export function requiredJavaVersion(minecraftVersion: string): number {
  const match = /^(\d+)\.(\d+)(?:\.(\d+))?/.exec(minecraftVersion.trim())
  if (!match) return NEWEST_KNOWN_JAVA

  const major = Number(match[1])
  const minor = Number(match[2])
  const patch = match[3] === undefined ? 0 : Number(match[3])

  // Releases before the versioning change all start with "1.".
  if (major !== 1) return NEWEST_KNOWN_JAVA

  if (minor <= 16) return LEGACY_DEFAULT_JAVA
  if (minor === 17) return 16
  if (minor <= 19) return 17
  // 1.20.5 is where the requirement moved from 17 to 21, mid-minor.
  if (minor === 20) return patch >= 5 ? 21 : 17
  if (minor <= 25) return 21
  return NEWEST_KNOWN_JAVA
}

/**
 * Pulls the feature version out of what `java -version` prints. Java 8 and earlier report
 * "1.8.0_402", where the feature number is the second component; later releases report "21.0.9".
 */
export function parseJavaFeatureVersion(reportedVersion: string): number | null {
  const match = /^(\d+)(?:\.(\d+))?/.exec(reportedVersion.trim())
  if (!match) return null

  const first = Number(match[1])
  if (first === 1) {
    return match[2] === undefined ? null : Number(match[2])
  }
  return first
}
