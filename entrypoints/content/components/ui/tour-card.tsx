import type { TourCardProps } from '@/types/product-tour';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';

export function TourCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  arrow,
  close,
}: TourCardProps) {
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="relative overflow-visible bg-popover text-popover-foreground border border-border rounded-xl shadow-lg p-4 w-70">
      {/* Arrow */}
      {arrow}

      {/* Close button */}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={close}
        className="absolute top-2 right-2"
      >
        <XIcon className="size-3" />
      </Button>

      {/* Content */}
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          {step.icon && <span className="text-lg">{step.icon}</span>}
          <h3 className="font-semibold text-sm">{step.title}</h3>
        </div>

        {/* Body */}
        <div className="text-sm text-muted-foreground">{step.content}</div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          {/* Progress */}
          <span className="text-xs text-muted-foreground">
            {currentStep + 1} / {totalSteps}
          </span>

          {/* Navigation */}
          <div className="flex gap-2">
            {!isFirstStep && (
              <Button variant="ghost" size="xs" onClick={prevStep}>
                Back
              </Button>
            )}
            <Button size="xs" onClick={nextStep}>
              {isLastStep ? 'Done' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
