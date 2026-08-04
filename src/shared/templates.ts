import { z } from 'zod'
import {
  NetworkingSchema,
  PerformanceSchema,
  ServerIdentitySchema,
  ServerSoftwareSelectionSchema,
  WorldSettingsSchema
} from './wizardConfig'

// A template captures everything except the machine-specific install directory
// and the plugin selection, since plugin availability can vary by Minecraft version.
export const TemplateAnswersSchema = z.object({
  serverSoftware: ServerSoftwareSelectionSchema.partial(),
  serverIdentity: ServerIdentitySchema.partial(),
  worldSettings: WorldSettingsSchema.partial(),
  performance: PerformanceSchema.partial(),
  networking: NetworkingSchema.partial()
})
export type TemplateAnswers = z.infer<typeof TemplateAnswersSchema>

export const SaveTemplateParamsSchema = z.object({
  name: z.string().trim().min(1, 'Template name is required').max(50, 'Keep it under 50 characters'),
  answers: TemplateAnswersSchema
})
export type SaveTemplateParams = z.infer<typeof SaveTemplateParamsSchema>

export interface ServerTemplate {
  id: string
  name: string
  createdAt: string
  answers: TemplateAnswers
}
