import { z } from 'zod'
import {
  NetworkingSchema,
  PerformanceSchema,
  PlayersSchema,
  ProjectBasicsSchema,
  ServerIdentitySchema,
  ServerSoftwareSelectionSchema,
  WorldSettingsSchema
} from './wizardConfig'
import type { WizardAnswers } from './wizardConfig'

export interface AddonFile {
  filePath: string
  fileName: string
}

export interface GenerateProjectParams {
  answers: WizardAnswers
  eulaAccepted: boolean
  pluginFiles?: AddonFile[]
}

const AddonFileSchema = z.object({
  filePath: z.string().min(1),
  fileName: z.string().min(1)
})

const SelectedPluginSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1)
})

// Wizard steps are saved as they're completed, so most sections are partial
// until Review & Generate; only the fields the generator actually reads are required here.
export const GenerateProjectParamsSchema = z.object({
  answers: z.object({
    projectBasics: ProjectBasicsSchema,
    serverSoftware: ServerSoftwareSelectionSchema,
    serverIdentity: ServerIdentitySchema.partial(),
    worldSettings: WorldSettingsSchema.partial(),
    performance: PerformanceSchema.partial(),
    networking: NetworkingSchema.partial(),
    players: PlayersSchema,
    plugins: z.object({ selected: z.array(SelectedPluginSchema) })
  }),
  eulaAccepted: z.boolean(),
  pluginFiles: z.array(AddonFileSchema).optional()
})

export interface GenerateProjectResult {
  projectPath: string
}
