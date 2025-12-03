'use client';

import { motion } from 'framer-motion';
import { PlayerRole } from '@lib/types';

interface RoleLabels {
  impostor: string;
  civilian: string;
  detective: string;
  joker: string;
}

interface RoleDisplayProps {
  role: PlayerRole;
  word?: string;
  labels: RoleLabels;
  wordLabel: string;
  detectiveHint?: string;
  jokerHint?: string;
}

const roleStyles = {
  impostor: {
    bg: 'bg-gradient-to-br from-red-900/80 to-red-700/80',
    border: 'border-red-500/50',
    badge: 'bg-red-500/30 text-red-200 border-red-400/50',
    hint: 'text-red-200',
  },
  civilian: {
    bg: 'bg-gradient-to-br from-emerald-900/80 to-emerald-700/80',
    border: 'border-emerald-500/50',
    badge: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/50',
    hint: 'text-emerald-300',
  },
  detective: {
    bg: 'bg-gradient-to-br from-blue-900/80 to-blue-700/80',
    border: 'border-blue-500/50',
    badge: 'bg-blue-500/30 text-blue-200 border-blue-400/50',
    hint: 'text-blue-300',
  },
  joker: {
    bg: 'bg-gradient-to-br from-yellow-900/80 to-amber-700/80',
    border: 'border-yellow-500/50',
    badge: 'bg-yellow-500/30 text-yellow-200 border-yellow-400/50',
    hint: 'text-yellow-300',
  },
};

export function RoleDisplay({
  role,
  word,
  labels,
  wordLabel,
  detectiveHint,
  jokerHint,
}: RoleDisplayProps) {
  const styles = roleStyles[role];
  
  const getRoleText = () => labels[role];

  const getHint = () => {
    switch (role) {
      case 'detective': return detectiveHint;
      case 'joker': return jokerHint;
      default: return null;
    }
  };

  const showWord = role !== 'impostor' && word;
  const hint = getHint();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        w-full h-full rounded-2xl p-6 flex flex-col items-center justify-center text-center
        ${styles.bg} border-2 ${styles.border}
      `}
    >
      {/* Role badge */}
      <div
        className={`
          px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4
          ${styles.badge} border
        `}
      >
        {getRoleText()}
      </div>

      {/* Word display (for civilians, detective, and joker) */}
      {showWord && (
        <div className="mt-2">
          <p className={`${styles.hint} text-sm mb-2`}>{wordLabel}</p>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
            <p className="text-3xl font-bold text-white tracking-wide">
              {word}
            </p>
          </div>
        </div>
      )}

      {/* Role-specific hint */}
      {hint && (
        <div className="mt-4 px-4">
          <p className={`${styles.hint} text-sm`}>
            {hint}
          </p>
        </div>
      )}
    </motion.div>
  );
}
