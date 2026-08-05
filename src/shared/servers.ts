import { z } from 'zod'
import { SERVER_SOFTWARE_IDS } from './serverSoftware'

export const RegisteredServerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  path: z.string().min(1),
  softwareId: z.enum(SERVER_SOFTWARE_IDS),
  minecraftVersion: z.string().min(1),
  serverPort: z.coerce.number().int().min(1).max(65535),
  createdAt: z.string().min(1)
})
export type RegisteredServer = z.infer<typeof RegisteredServerSchema>

export const RegisterServerParamsSchema = RegisteredServerSchema.omit({ id: true, createdAt: true })
export type RegisterServerParams = z.infer<typeof RegisterServerParamsSchema>
