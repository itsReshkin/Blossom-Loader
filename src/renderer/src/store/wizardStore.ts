import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WizardAnswers, initialWizardAnswers } from '@shared/wizardConfig'

interface WizardStore {
  answers: WizardAnswers
  currentStepId: string
  updateAnswers: (patch: Partial<WizardAnswers>) => void
  setStepId: (id: string) => void
  resetWizard: () => void
}

// Bump this whenever the shape of WizardAnswers changes. A version mismatch discards the
// persisted draft instead of merging incompatible data in, which would otherwise crash any
// step that reads a field the old draft doesn't have.
const WIZARD_STORE_VERSION = 1

export const useWizardStore = create<WizardStore>()(
  persist(
    (set) => ({
      answers: initialWizardAnswers,
      currentStepId: '',
      updateAnswers: (patch) => set((state) => ({ answers: { ...state.answers, ...patch } })),
      setStepId: (id) => set({ currentStepId: id }),
      resetWizard: () => set({ answers: initialWizardAnswers, currentStepId: '' })
    }),
    {
      name: 'blossom-wizard-draft',
      version: WIZARD_STORE_VERSION,
      migrate: (_persisted, version) => {
        if (version !== WIZARD_STORE_VERSION) {
          return { answers: initialWizardAnswers, currentStepId: '' }
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
