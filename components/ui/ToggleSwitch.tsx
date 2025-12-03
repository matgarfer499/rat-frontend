'use client';

import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export function ToggleSwitch({ checked, onChange, label, description }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between py-2 group"
    >
      <div className="text-left">
        <span className="text-white font-medium">{label}</span>
        {description && (
          <p className="text-gray-muted text-xs mt-0.5">{description}</p>
        )}
      </div>
      
      <div
        className={`
          relative w-12 h-7 rounded-full transition-colors duration-200 flex items-center
          ${checked ? 'bg-purple-base' : 'bg-purple-darker border border-purple-base/30'}
        `}
      >
        <motion.div
          animate={{ x: checked ? 24 : 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`
            w-5 h-5 rounded-full
            ${checked ? 'bg-white' : 'bg-gray-muted'}
          `}
        />
      </div>
    </button>
  );
}
