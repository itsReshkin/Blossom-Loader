export interface PrerequisiteStatus {
  available: boolean
  version?: string
}

export interface PrerequisitesCheckResult {
  java: PrerequisiteStatus
  git: PrerequisiteStatus
}
