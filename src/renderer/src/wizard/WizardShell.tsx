import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button, WizardProgress } from '@renderer/ui'
import { useWizardStore } from '@renderer/store/wizardStore'
import { wizardSteps } from './steps'

interface WizardShellProps {
  onExit: () => void
}

export function WizardShell({ onExit }: WizardShellProps) {
  const currentStepId = useWizardStore((state) => state.currentStepId)
  const answers = useWizardStore((state) => state.answers)
  const setStepId = useWizardStore((state) => state.setStepId)

  const visibleSteps = useMemo(
    () => wizardSteps.filter((step) => step.isApplicable?.(answers) ?? true),
    [answers]
  )

  const rawIndex = visibleSteps.findIndex((step) => step.id === currentStepId)
  const currentIndex = rawIndex === -1 ? 0 : rawIndex
  const step = visibleSteps[currentIndex]

  const isFirstStep = currentIndex === 0
  const isLastStep = currentIndex === visibleSteps.length - 1
  const canProceed = step.isComplete(answers)

  const handleBack = () => {
    if (isFirstStep) {
      onExit()
      return
    }
    setStepId(visibleSteps[currentIndex - 1].id)
  }

  const handleNext = () => {
    if (!canProceed || isLastStep) return
    setStepId(visibleSteps[currentIndex + 1].id)
  }

  const StepComponent = step.Component

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-(--color-border) px-8 py-4">
        <WizardProgress steps={visibleSteps} currentStepIndex={currentIndex} />
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8">
        <motion.div
          key={step.id}
          className="mx-auto max-w-lg"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <StepComponent />
        </motion.div>
      </div>

      <div className="flex items-center justify-between border-t border-(--color-border) px-8 py-4">
        <Button variant="ghost" leftIcon={<ChevronLeft size={16} />} onClick={handleBack}>
          {isFirstStep ? 'Cancel' : 'Back'}
        </Button>
        {!isLastStep && (
          <Button rightIcon={<ChevronRight size={16} />} onClick={handleNext} disabled={!canProceed}>
            Next
          </Button>
        )}
      </div>
    </div>
  )
}
