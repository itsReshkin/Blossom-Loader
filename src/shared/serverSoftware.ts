export const SERVER_SOFTWARE_IDS = ['vanilla', 'paper', 'spigot', 'fabric', 'forge'] as const
export type ServerSoftwareId = (typeof SERVER_SOFTWARE_IDS)[number]

export interface ServerSoftwareDefinition {
  id: ServerSoftwareId
  name: string
  description: string
  supportsPlugins: boolean
  supportsMods: boolean
  recommended?: boolean
}

export const SERVER_SOFTWARE_CATALOG: ServerSoftwareDefinition[] = [
  {
    id: 'vanilla',
    name: 'Vanilla',
    description: 'The official, unmodified Minecraft server from Mojang.',
    supportsPlugins: false,
    supportsMods: false
  },
  {
    id: 'paper',
    name: 'Paper',
    description: 'High-performance server with extensive plugin support. Recommended for most servers.',
    supportsPlugins: true,
    supportsMods: false,
    recommended: true
  },
  {
    id: 'spigot',
    name: 'Spigot',
    description:
      'The plugin-compatible foundation that Paper is built on. Built from source locally (needs Java + Git, takes several minutes).',
    supportsPlugins: true,
    supportsMods: false
  },
  {
    id: 'fabric',
    name: 'Fabric',
    description: 'A lightweight, modern modding platform.',
    supportsPlugins: false,
    supportsMods: true
  },
  {
    id: 'forge',
    name: 'Forge',
    description: 'The most widely supported modding platform for Minecraft.',
    supportsPlugins: false,
    supportsMods: true
  }
]
