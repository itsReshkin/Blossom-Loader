import { ComponentType } from 'react'
import { WizardAnswers } from '@shared/wizardConfig'

export interface WizardStepDefinition {
  id: string
  label: string
  Component: ComponentType
  isComplete: (answers: WizardAnswers) => boolean
  isApplicable?: (answers: WizardAnswers) => boolean
}
