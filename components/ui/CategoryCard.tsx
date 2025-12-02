'use client';

import { motion } from 'framer-motion';
import { CheckIcon } from '@components/icons';

interface CategoryCardProps {
  name: string;
  isSelected: boolean;
  onClick: () => void;
}

export function CategoryCard({ name, isSelected, onClick }: CategoryCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative w-full p-4 rounded-xl text-left
        transition-all duration-200
        border-2
        ${isSelected
          ? 'bg-purple-base/30 border-purple-light shadow-[0_0_20px_rgba(168,85,247,0.3)]'
          : 'bg-purple-dark/30 border-purple-base/30 hover:border-purple-base/60 hover:bg-purple-dark/50'
        }
      `}
    >
      <div className="flex items-center justify-between gap-3">
        <span className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-muted'}`}>
          {name}
        </span>
        
        {/* Checkbox indicator */}
        <div
          className={`
            w-6 h-6 rounded-md flex items-center justify-center
            transition-all duration-200
            ${isSelected
              ? 'bg-purple-base text-white'
              : 'bg-purple-dark/50 border border-purple-base/40'
            }
          `}
        >
          {isSelected && <CheckIcon size={16} />}
        </div>
      </div>
    </motion.button>
  );
}
