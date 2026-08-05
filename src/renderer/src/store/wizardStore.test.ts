import { describe, expect, it } from 'vitest'
import { initialWizardAnswers } from '@shared/wizardConfig'
import { canResumeDraft } from './wizardStore'

function state(overrides: Partial<Parameters<typeof canResumeDraft>[0]> = {}) {
  return {
    answers: initialWizardAnswers,
    currentStepId: '',
    generatedAt: null,
    ...overrides
  }
}

function answersNamed(projectName: string) {
  return { ...initialWizardAnswers, projectBasics: { projectName } }
}

describe('canResumeDraft', () => {
  it('offers nothing on a clean slate', () => {
    expect(canResumeDraft(state())).toBe(false)
  })

  it('offers to resume a part-filled draft', () => {
    expect(
      canResumeDraft(state({ answers: answersNamed('My Server'), currentStepId: 'server-software' }))
    ).toBe(true)
  })

  // The reported bug: after generating, starting a new server jumped to the last step and reused
  // the finished server's settings.
  it('does not offer to resume answers that already produced a server', () => {
    expect(
      canResumeDraft(
        state({
          answers: answersNamed('My Server'),
          currentStepId: 'review-generate',
          generatedAt: '2026-08-05T17:00:00.000Z'
        })
      )
    ).toBe(false)
  })

  it('does not offer to resume when no project name was entered yet', () => {
    expect(canResumeDraft(state({ currentStepId: 'project-basics' }))).toBe(false)
  })

  it('does not offer to resume when the wizard was never opened', () => {
    expect(canResumeDraft(state({ answers: answersNamed('My Server') }))).toBe(false)
  })
})
