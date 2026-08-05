export interface SystemMemoryInfo {
  totalGB: number
  /** Largest allocation we let the user pick, leaving headroom for the OS. */
  recommendedMaxGB: number
}

export interface PortCheckResult {
  port: number
  available: boolean
}

export interface LocalNetworkAddress {
  address: string
  interfaceName: string
}
