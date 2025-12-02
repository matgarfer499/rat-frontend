'use client';

import { MinusIcon, PlusIcon } from '@components/icons';

interface NumberStepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
}

export function NumberStepper({ value, min, max, onChange, label }: NumberStepperProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const isMinDisabled = value <= min;
  const isMaxDisabled = value >= max;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-semibold text-gray-muted">{label}</label>
      )}
      <div className="flex items-center justify-center gap-4">
        {/* Decrement button */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={isMinDisabled}
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center
            transition-all duration-200
            ${isMinDisabled
              ? 'bg-gray-dark/30 text-gray-muted cursor-not-allowed'
              : 'bg-purple-base/30 border border-purple-base/50 text-purple-light hover:bg-purple-base/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] active:scale-95'
            }
          `}
          aria-label="Decrease"
        >
          <MinusIcon size={20} />
        </button>

        {/* Value display */}
        <div className="w-20 h-14 rounded-xl bg-purple-dark/50 border border-purple-base/40 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{value}</span>
        </div>

        {/* Increment button */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={isMaxDisabled}
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center
            transition-all duration-200
            ${isMaxDisabled
              ? 'bg-gray-dark/30 text-gray-muted cursor-not-allowed'
              : 'bg-purple-base/30 border border-purple-base/50 text-purple-light hover:bg-purple-base/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] active:scale-95'
            }
          `}
          aria-label="Increase"
        >
          <PlusIcon size={20} />
        </button>
      </div>
      
      {/* Range indicator */}
      <p className="text-xs text-gray-muted text-center">
        {min} - {max}
      </p>
    </div>
  );
}
