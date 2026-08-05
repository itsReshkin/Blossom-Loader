export interface PrerequisiteStatus {
  available: boolean
  version?: string
}

export interface PrerequisitesCheckResult {
  java: PrerequisiteStatus
  git: PrerequisiteStatus
  /** Java feature version the selected Minecraft version needs, so the UI can name it. */
  requiredJava: number
}
