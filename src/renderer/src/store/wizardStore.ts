import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WizardAnswers, initialWizardAnswers } from '@shared/wizardConfig'

interface WizardStore {
  answers: WizardAnswers
  currentStepId: string
  /** Set once a server was generated from these answers, so they are no longer an open draft. */
  generatedAt: string | null
  updateAnswers: (patch: Partial<WizardAnswers>) => void
  setStepId: (id: string) => void
  markGenerated: () => void
  resetWizard: () => void
}

// Bump this whenever the shape of WizardAnswers changes. A version mismatch discards the
// persisted draft instead of merging incompatible data in, which would otherwise crash any
// step that reads a field the old draft doesn't have.
const WIZARD_STORE_VERSION = 3

/**
 * Whether there is an unfinished draft worth offering to resume.
 *
 * The draft is persisted so progress survives a restart, but a set of answers that already
 * produced a server is finished — resuming it would drop the user on the final step with the
 * previous server's settings instead of starting a new one.
 */
export function canResumeDraft(state: Pick<WizardStore, 'answers' | 'currentStepId' | 'generatedAt'>) {
  if (state.generatedAt !== null) return false
  if (state.currentStepId === '') return false
  return Boolean(state.answers.projectBasics.projectName)
}

export const useWizardStore = create<WizardStore>()(
  persist(
    (set) => ({
      answers: initialWizardAnswers,
      currentStepId: '',
      generatedAt: null,
      updateAnswers: (patch) => set((state) => ({ answers: { ...state.answers, ...patch } })),
      setStepId: (id) => set({ currentStepId: id }),
      markGenerated: () => set({ generatedAt: new Date().toISOString() }),
      resetWizard: () => set({ answers: initialWizardAnswers, currentStepId: '', generatedAt: null })
    }),
    {
      name: 'blossom-wizard-draft',
      version: WIZARD_STORE_VERSION,
      migrate: (_persisted, version) => {
        if (version !== WIZARD_STORE_VERSION) {
          return { answers: initialWizardAnswers, currentStepId: '', generatedAt: null }
        }
        return _persisted as WizardStore
      },
      merge: (persisted, current) => {
        const persistedStore = persisted as Partial<WizardStore> | undefined
        return {
          ...current,
          ...persistedStore,
          answers: { ...current.answers, ...persistedStore?.answers }
        }
      }
    }
  )
)
