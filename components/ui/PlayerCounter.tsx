'use client';

import { MinusIcon, PlusIcon } from '@components/icons';

interface PlayerCounterProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
}

export function PlayerCounter({ value, min, max, onChange, label }: PlayerCounterProps) {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center pt-8 pb-6 px-4">
      <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-4">
        {label}
      </h3>
      <div className="flex items-center gap-8">
        <button 
          onClick={handleDecrement}
          disabled={value <= min}
          className="size-14 rounded-full bg-gray-200 dark:bg-[#1f2937] text-slate-900 dark:text-white 
                   flex items-center justify-center shadow-lg active:scale-95 transition-transform
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <MinusIcon size={24} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
            {value}
          </span>
        </div>
        <button 
          onClick={handleIncrement}
          disabled={value >= max}
          className="size-14 rounded-full bg-primary text-white flex items-center justify-center 
                   shadow-lg shadow-primary/30 active:scale-95 transition-transform
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <PlusIcon size={24} />
        </button>
      </div>
    </div>
  );
}
