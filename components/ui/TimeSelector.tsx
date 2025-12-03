'use client';

import { motion } from 'framer-motion';
import { MinusIcon, PlusIcon } from '@components/icons';

interface TimeSelectorProps {
  value: number; // in seconds
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
  disabled?: boolean;
}

export function TimeSelector({
  value,
  onChange,
  min,
  max,
  step,
  label,
  disabled = false,
}: TimeSelectorProps) {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;

  const handleDecrease = () => {
    if (value - step >= min) {
      onChange(value - step);
    }
  };

  const handleIncrease = () => {
    if (value + step <= max) {
      onChange(value + step);
    }
  };

  const formatTime = () => {
    if (minutes > 0 && seconds > 0) {
      return `${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes} min`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className={`flex items-center justify-between ${disabled ? 'opacity-50' : ''}`}>
      <span className="text-gray-muted text-sm">{label}</span>
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleDecrease}
          disabled={disabled || value <= min}
          className="w-9 h-9 rounded-lg bg-purple-base/20 border border-purple-base/30
                     flex items-center justify-center
                     disabled:opacity-30 disabled:cursor-not-allowed
                     hover:bg-purple-base/30 transition-colors"
        >
          <MinusIcon size={18} className="text-purple-light" />
        </motion.button>

        <div className="w-20 text-center">
          <span className="text-white font-bold text-lg font-mono">{formatTime()}</span>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleIncrease}
          disabled={disabled || value >= max}
          className="w-9 h-9 rounded-lg bg-purple-base/20 border border-purple-base/30
                     flex items-center justify-center
                     disabled:opacity-30 disabled:cursor-not-allowed
                     hover:bg-purple-base/30 transition-colors"
        >
          <PlusIcon size={18} className="text-purple-light" />
        </motion.button>
      </div>
    </div>
  );
}
