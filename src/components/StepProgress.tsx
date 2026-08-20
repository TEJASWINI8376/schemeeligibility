import React from 'react';
import { Check } from 'lucide-react';

interface StepProgressProps {
  currentStep: number;
  totalSteps?: number;
  stepTitles?: string[];
  onStepClick?: (step: number) => void;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  totalSteps = 4,
  stepTitles = ['Basic Info', 'Socio-Economic', 'Needs & Assets', 'Review & Match'],
  onStepClick,
}) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);
  const currentTitle = stepTitles[currentStep - 1] || 'Details';

  return (
    <div aria-label={`Progress: Step ${currentStep} of ${totalSteps}`} className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-slate-500">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-semibold text-[#003366]">
          {currentTitle}
        </span>
      </div>

      {/* Main progress bar */}
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        <div
          className="h-full bg-gradient-to-r from-[#003366] to-[#0284c7] transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="grid grid-cols-4 gap-2 mt-3">
        {stepTitles.map((title, idx) => {
          const stepNumber = idx + 1;
          const isDone = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <button
              key={title}
              type="button"
              onClick={() => onStepClick && isDone && onStepClick(stepNumber)}
              disabled={!isDone && !isCurrent}
              className={`text-left text-xs px-2.5 py-1.5 rounded-lg border transition-all truncate flex items-center gap-1.5 ${
                isCurrent
                  ? 'bg-blue-50 text-[#003366] border-blue-300 font-semibold shadow-2xs'
                  : isDone
                  ? 'bg-emerald-50 text-[#008744] border-emerald-200 font-medium hover:bg-emerald-100/70 cursor-pointer'
                  : 'bg-white text-slate-400 border-slate-200 cursor-default font-normal'
              }`}
            >
              {isDone ? (
                <Check className="w-3.5 h-3.5 text-[#008744] shrink-0" />
              ) : (
                <span className="text-[11px] opacity-75">{stepNumber}.</span>
              )}
              <span className="truncate">{title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
