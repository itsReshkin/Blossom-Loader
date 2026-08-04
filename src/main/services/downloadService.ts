import { createHash } from 'crypto'
import { createWriteStream } from 'fs'
import { mkdir, rm } from 'fs/promises'
import { dirname } from 'path'

export interface DownloadProgress {
  bytesReceived: number
  totalBytes: number
}

export interface ChecksumSpec {
  algorithm: 'sha1' | 'sha256'
  value: string
}

export async function downloadFile(
  url: string,
  destinationPath: string,
  checksum: ChecksumSpec | null,
  onProgress?: (progress: DownloadProgress) => void
): Promise<void> {
  await mkdir(dirname(destinationPath), { recursive: true })

  const response = await fetch(url, {
    headers: { 'User-Agent': 'Blossom/0.1.0 (Minecraft server creation wizard)' }
  })
  if (!response.ok || !response.body) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`)
  }

  const totalBytes = Number(response.headers.get('content-length') ?? 0)
  const hash = checksum ? createHash(checksum.algorithm) : null
  let bytesReceived = 0

  const writeStream = createWriteStream(destinationPath)

  try {
    for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
      hash?.update(chunk)
      bytesReceived += chunk.length
      onProgress?.({ bytesReceived, totalBytes })
      await new Promise<void>((resolve, reject) => {
        writeStream.write(chunk, (err) => (err ? reject(err) : resolve()))
      })
    }
  } finally {
    await new Promise<void>((resolve) => writeStream.end(resolve))
  }

  if (checksum && hash) {
    const actualChecksum = hash.digest('hex')
    if (actualChecksum !== checksum.value.toLowerCase()) {
      await rm(destinationPath, { force: true })
      throw new Error('Checksum verification failed. The downloaded file may be corrupted.')
    }
  }
}
