'use client';

import { MaskIcon, MinusIcon, PlusIcon } from '@components/icons';
import { ToggleSwitch } from './ToggleSwitch';

interface ImpostorConfigProps {
  count: number;
  maxCount: number;
  randomMode: boolean;
  onCountChange: (count: number) => void;
  onRandomModeChange: (enabled: boolean) => void;
  label: string;
  randomModeLabel: string;
  randomModeDesc: string;
}

export function ImpostorConfig({ 
  count, 
  maxCount,
  randomMode,
  onCountChange, 
  onRandomModeChange,
  label,
  randomModeLabel,
  randomModeDesc,
}: ImpostorConfigProps) {
  const handleIncrement = () => {
    if (count < maxCount) {
      onCountChange(count + 1);
    }
  };

  const handleDecrement = () => {
    if (count > 1) {
      onCountChange(count - 1);
    }
  };

  return (
    <div className="flex flex-col p-4 rounded-3xl bg-white dark:bg-[#1f2937] shadow-sm gap-3">
      {/* Impostor Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-full flex items-center justify-center text-red-500">
            <MaskIcon size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-900 dark:text-white font-bold text-base">
              {label}
            </span>
            {!randomMode && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Máx: {maxCount}
              </span>
            )}
          </div>
        </div>
        
        {/* Counter Controls */}
        <div className="flex items-center gap-2">
          {randomMode ? (
            <span className="text-slate-900 dark:text-white font-bold text-base px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-500">
              Aleatorio
            </span>
          ) : (
            <>
              <button
                onClick={handleDecrement}
                disabled={count <= 1}
                className="size-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center 
                         disabled:opacity-30 disabled:cursor-not-allowed transition-all
                         active:scale-95 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <MinusIcon size={16} className="text-gray-700 dark:text-gray-300" />
              </button>
              <span className="text-slate-900 dark:text-white font-bold text-lg min-w-[32px] text-center">
                {count}
              </span>
              <button
                onClick={handleIncrement}
                disabled={count >= maxCount}
                className="size-8 rounded-full bg-primary flex items-center justify-center 
                         disabled:opacity-30 disabled:cursor-not-allowed transition-all
                         active:scale-95 hover:bg-primary/90"
              >
                <PlusIcon size={16} className="text-white" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Random Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col pl-14">
          <span className="text-slate-900 dark:text-white font-semibold text-sm">
            {randomModeLabel}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {randomModeDesc}
          </span>
        </div>
        <ToggleSwitch checked={randomMode} onChange={onRandomModeChange} />
      </div>
    </div>
  );
}
