import { z } from 'zod'
import { SERVER_SOFTWARE_IDS } from './serverSoftware'

export const ProjectBasicsSchema = z.object({
  projectName: z
    .string()
    .trim()
    .min(1, 'Project name is required')
    .max(50, 'Keep it under 50 characters')
    .regex(/^[a-zA-Z0-9 _-]+$/, 'Only letters, numbers, spaces, - and _ are allowed'),
  installDirectory: z.string().min(1, 'Choose where to create the server')
})
export type ProjectBasics = z.infer<typeof ProjectBasicsSchema>

export const ServerSoftwareSelectionSchema = z.object({
  softwareId: z.enum(SERVER_SOFTWARE_IDS, { message: 'Select a server software' }),
  minecraftVersion: z.string().min(1, 'Select a Minecraft version')
})
export type ServerSoftwareSelection = z.infer<typeof ServerSoftwareSelectionSchema>

export const DIFFICULTY_VALUES = ['peaceful', 'easy', 'normal', 'hard'] as const
export const GAMEMODE_VALUES = ['survival', 'creative', 'adventure', 'spectator'] as const

export const ServerIdentitySchema = z.object({
  motd: z
    .string()
    .trim()
    .min(1, 'Enter a message of the day')
    .max(59, 'Keep it under 59 characters so it fits the server list'),
  maxPlayers: z.coerce.number().int().min(1, 'Must be at least 1').max(200, 'Keep it under 200'),
  difficulty: z.enum(DIFFICULTY_VALUES),
  gamemode: z.enum(GAMEMODE_VALUES),
  hardcore: z.boolean(),
  pvp: z.boolean(),
  whitelist: z.boolean()
})
export type ServerIdentity = z.infer<typeof ServerIdentitySchema>

export const WORLD_TYPE_VALUES = ['default', 'flat', 'large_biomes', 'amplified'] as const

export const WorldSettingsSchema = z.object({
  worldType: z.enum(WORLD_TYPE_VALUES),
  seed: z.string().trim().max(100, 'Keep it under 100 characters'),
  generateStructures: z.boolean(),
  viewDistance: z.coerce.number().int().min(3, 'Minimum is 3').max(32, 'Maximum is 32'),
  simulationDistance: z.coerce.number().int().min(3, 'Minimum is 3').max(32, 'Maximum is 32'),
  spawnProtection: z.coerce.number().int().min(0, 'Cannot be negative').max(64, 'Keep it under 64')
})
export type WorldSettings = z.infer<typeof WorldSettingsSchema>

export const PerformanceSchema = z.object({
  memoryGB: z.coerce.number().int().min(1, 'At least 1 GB').max(32, 'Keep it under 32 GB'),
  autoRestart: z.boolean()
})
export type Performance = z.infer<typeof PerformanceSchema>

export const NetworkingSchema = z.object({
  serverPort: z.coerce.number().int().min(1, 'Invalid port').max(65535, 'Invalid port'),
  onlineMode: z.boolean()
})
export type Networking = z.infer<typeof NetworkingSchema>

export interface SelectedPlugin {
  slug: string
  name: string
}

export interface PluginSelection {
  selected: SelectedPlugin[]
}

export interface WizardAnswers {
  projectBasics: Partial<ProjectBasics>
  serverSoftware: Partial<ServerSoftwareSelection>
  serverIdentity: Partial<ServerIdentity>
  worldSettings: Partial<WorldSettings>
  performance: Partial<Performance>
  networking: Partial<Networking>
  plugins: PluginSelection
}

export const initialWizardAnswers: WizardAnswers = {
  projectBasics: {},
  serverSoftware: {},
  serverIdentity: {
    maxPlayers: 20,
    difficulty: 'easy',
    gamemode: 'survival',
    hardcore: false,
    pvp: true,
    whitelist: false
  },
  worldSettings: {
    worldType: 'default',
    seed: '',
    generateStructures: true,
    viewDistance: 10,
    simulationDistance: 10,
    spawnProtection: 16
  },
  performance: {
    memoryGB: 4,
    autoRestart: true
  },
  networking: {
    serverPort: 25565,
    onlineMode: true
  },
  plugins: {
    selected: []
  }
}
