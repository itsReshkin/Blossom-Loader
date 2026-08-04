import { motion } from 'framer-motion'
import { cn } from '@renderer/utils/cn'

export interface WizardProgressStep {
  id: string
  label: string
}

interface WizardProgressProps {
  steps: WizardProgressStep[]
  currentStepIndex: number
}

export function WizardProgress({ steps, currentStepIndex }: WizardProgressProps) {
  const current = steps[currentStepIndex]

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex gap-1.5"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={currentStepIndex + 1}
      >
        {steps.map((step, index) => {
          const state = index < currentStepIndex ? 'done' : index === currentStepIndex ? 'active' : 'upcoming'

          return (
            <div key={step.id} className="h-1.5 flex-1 overflow-hidden rounded-full bg-(--color-border)">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  state === 'upcoming' ? 'bg-transparent' : 'bg-(--color-accent)'
                )}
                initial={false}
                animate={{ width: state === 'upcoming' ? '0%' : '100%' }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              />
            </div>
          )
        })}
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-(--color-text)">{current?.label}</span>
        <span className="text-xs text-(--color-text-subtle)">
          Step {currentStepIndex + 1} of {steps.length}
        </span>
      </div>
    </div>
  )
}
