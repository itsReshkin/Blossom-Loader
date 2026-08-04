import type { BlossomApi } from './index'

declare global {
  interface Window {
    blossom: BlossomApi
  }
}
