import {
  NetworkingSchema,
  PerformanceSchema,
  ProjectBasicsSchema,
  ServerIdentitySchema,
  ServerSoftwareSelectionSchema,
  WorldSettingsSchema
} from '@shared/wizardConfig'
import { ProjectBasicsStep } from './steps/ProjectBasicsStep'
import { ServerSoftwareStep } from './steps/ServerSoftwareStep'
import { PluginsStep } from './steps/PluginsStep'
import { ServerIdentityStep } from './steps/ServerIdentityStep'
import { WorldSettingsStep } from './steps/WorldSettingsStep'
import { PerformanceStep } from './steps/PerformanceStep'
import { NetworkingStep } from './steps/NetworkingStep'
import { ReviewGenerateStep } from './steps/ReviewGenerateStep'
import { WizardStepDefinition } from './types'

export const wizardSteps: WizardStepDefinition[] = [
  {
    id: 'project-basics',
    label: 'Project Basics',
    Component: ProjectBasicsStep,
    isComplete: (answers) => ProjectBasicsSchema.safeParse(answers.projectBasics).success
  },
  {
    id: 'server-software',
    label: 'Server Software',
    Component: ServerSoftwareStep,
    isComplete: (answers) => ServerSoftwareSelectionSchema.safeParse(answers.serverSoftware).success
  },
  {
    id: 'plugins',
    label: 'Plugins & Mods',
    Component: PluginsStep,
    isComplete: () => true,
    isApplicable: (answers) =>
      answers.serverSoftware.softwareId !== undefined && answers.serverSoftware.softwareId !== 'vanilla'
  },
  {
    id: 'server-identity',
    label: 'Server Identity',
    Component: ServerIdentityStep,
    isComplete: (answers) => ServerIdentitySchema.safeParse(answers.serverIdentity).success
  },
  {
    id: 'world-settings',
    label: 'World Settings',
    Component: WorldSettingsStep,
    isComplete: (answers) => WorldSettingsSchema.safeParse(answers.worldSettings).success
  },
  {
    id: 'performance',
    label: 'Performance',
    Component: PerformanceStep,
    isComplete: (answers) => PerformanceSchema.safeParse(answers.performance).success
  },
  {
    id: 'networking',
    label: 'Networking',
    Component: NetworkingStep,
    isComplete: (answers) => NetworkingSchema.safeParse(answers.networking).success
  },
  {
    id: 'review-generate',
    label: 'Review & Generate',
    Component: ReviewGenerateStep,
    isComplete: () => true
  }
]
