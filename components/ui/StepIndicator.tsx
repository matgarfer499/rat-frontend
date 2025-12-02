interface Step {
  label: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface StepIndicatorProps {
  steps: Step[];
}

export function StepIndicator({ steps }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            {/* Step circle with label */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  transition-all duration-300
                  ${step.isCompleted 
                    ? 'bg-purple-base text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' 
                    : step.isCurrent
                      ? 'bg-purple-base/30 border-2 border-purple-light text-purple-light shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                      : 'bg-purple-dark/50 border-2 border-gray-dark text-gray-muted'
                  }
                `}
              >
                {step.isCompleted ? '✓' : index + 1}
              </div>
              <span
                className={`
                  text-xs font-medium mt-2 transition-colors duration-300 whitespace-nowrap
                  ${step.isCurrent || step.isCompleted ? 'text-purple-light' : 'text-gray-muted'}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-1 mx-3 rounded-full transition-all duration-300 self-start mt-4
                  ${step.isCompleted 
                    ? 'bg-purple-base shadow-[0_0_8px_rgba(168,85,247,0.4)]' 
                    : 'bg-gray-dark/50'
                  }
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
