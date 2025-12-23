'use client';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export function ToggleSwitch({ checked, onChange, label, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        {label && (
          <label className="text-sm font-medium text-gray-900 dark:text-white block mb-1">
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
        <input 
          type="checkbox" 
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer" 
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
      </label>
    </div>
  );
}
