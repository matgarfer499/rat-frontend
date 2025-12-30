'use client';

import { motion } from 'framer-motion';
import { CheckIcon, MaskIcon } from '@components/icons';

interface ResultBannerProps {
  playerWon: boolean;
  title: string;
  description: string;
}

export function ResultBanner({ playerWon, title, description }: ResultBannerProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-center border ${
      playerWon 
        ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-900/20 to-emerald-700/10' 
        : 'border-red-500/50 bg-gradient-to-br from-red-900/20 to-red-700/10'
    }`}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
        style={{
          background: playerWon 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(168, 85, 247, 0.2))',
        }}
      >
        {playerWon ? (
          <CheckIcon size={40} className="text-emerald-400" />
        ) : (
          <MaskIcon size={40} className="text-red-400" />
        )}
      </motion.div>
      <h1 className={`text-3xl font-bold ${
        playerWon ? 'text-emerald-400' : 'text-red-400'
      }`}>
        {title}
      </h1>
      <p className="text-gray-400 mt-2">
        {description}
      </p>
    </div>
  );
}
