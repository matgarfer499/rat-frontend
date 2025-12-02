'use client';

import { motion } from 'framer-motion';

interface RoleDisplayProps {
  isImpostor: boolean;
  word?: string;
  impostorText: string;
  civilianText: string;
  wordLabel: string;
}

export function RoleDisplay({
  isImpostor,
  word,
  impostorText,
  civilianText,
  wordLabel,
}: RoleDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        w-full h-full rounded-2xl p-6 flex flex-col items-center justify-center text-center
        ${isImpostor
          ? 'bg-gradient-to-br from-red-900/80 to-red-700/80 border-2 border-red-500/50'
          : 'bg-gradient-to-br from-emerald-900/80 to-emerald-700/80 border-2 border-emerald-500/50'
        }
      `}
    >
      {/* Role badge */}
      <div
        className={`
          px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4
          ${isImpostor
            ? 'bg-red-500/30 text-red-200 border border-red-400/50'
            : 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/50'
          }
        `}
      >
        {isImpostor ? impostorText : civilianText}
      </div>

      {/* Word display for civilians */}
      {!isImpostor && word && (
        <div className="mt-4">
          <p className="text-emerald-300 text-sm mb-2">{wordLabel}</p>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-emerald-400/30">
            <p className="text-3xl font-bold text-white tracking-wide">
              {word}
            </p>
          </div>
        </div>
      )}

      {/* Impostor message */}
      {isImpostor && (
        <div className="mt-4">
          <p className="text-red-200 text-lg">
            You don&apos;t know the word
          </p>
        </div>
      )}
    </motion.div>
  );
}
