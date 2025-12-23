'use client';

import { ToggleSwitch } from './ToggleSwitch';

interface ToggleCardProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export function ToggleCard({ checked, onChange, label, description }: ToggleCardProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#1f2937] shadow-sm">
      <div className="flex-1 text-left">
        <span className="text-slate-900 dark:text-white font-bold text-base">{label}</span>
        {description && (
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{description}</p>
        )}
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
}
