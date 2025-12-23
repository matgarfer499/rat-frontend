'use client';

import { ReactNode } from 'react';
import { ToggleSwitch } from './ToggleSwitch';

interface RoleToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
  icon: ReactNode;
  iconColor: 'blue' | 'yellow' | 'green' | 'purple';
}

const ICON_COLORS = {
  blue: 'text-blue-500',
  yellow: 'text-yellow-500',
  green: 'text-green-500',
  purple: 'text-purple-500',
};

export function RoleToggle({ 
  checked, 
  onChange, 
  label, 
  description, 
  icon,
  iconColor 
}: RoleToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-full bg-white dark:bg-[#1f2937] shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`size-10 rounded-full flex items-center justify-center ${ICON_COLORS[iconColor]}`}>
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-slate-900 dark:text-white font-bold text-base">
            {label}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {description}
          </span>
        </div>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
}
