import { REQUEST_HEADERS } from '../core/userAgent'

const ADOPTIUM_API_BASE = 'https://api.adoptium.net/v3'
const JAVA_FEATURE_VERSION = 21

interface AdoptiumAsset {
  binary: {
    package: {
      link: string
      name: string
      checksum: string
    }
  }
}

export interface PortableJavaInfo {
  url: string
  filename: string
  sha256: string
}

export async function getLatestPortableJre(): Promise<PortableJavaInfo> {
  const query = new URLSearchParams({
    os: 'windows',
    arch: 'x64',
    image_type: 'jre',
    vendor: 'eclipse'
  })
  const response = await fetch(
    `${ADOPTIUM_API_BASE}/assets/latest/${JAVA_FEATURE_VERSION}/hotspot?${query}`,
    {
      headers: REQUEST_HEADERS
    }
  )
  if (!response.ok) {
    throw new Error(`Failed to fetch Java runtime info: ${response.status} ${response.statusText}`)
  }

  const assets = (await response.json()) as AdoptiumAsset[]
  const asset = assets[0]
  if (!asset) {
    throw new Error('No Java runtime build is available for this platform.')
  }

  return {
    url: asset.binary.package.link,
    filename: asset.binary.package.name,
    sha256: asset.binary.package.checksum
  }
}
