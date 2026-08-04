export type InstallProgressEvent =
  | { kind: 'status'; message: string }
  | { kind: 'download'; label: string; bytesReceived: number; totalBytes: number }
  | { kind: 'log'; line: string }
