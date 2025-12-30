'use client';

import { motion } from 'framer-motion';
import { Card } from '@components/ui';
import {
  UserIcon,
  MaskIcon,
  DetectiveIcon,
  JokerIcon,
} from '@components/icons';

interface Player {
  id: string;
  username: string;
  role?: string | null;
  word?: string | null;
}

interface RoleRevealContentProps {
  currentPlayer: Player | null;
  timeRemaining: number;
  dict: any;
}

export function RoleRevealContent({
  currentPlayer,
  timeRemaining,
  dict,
}: RoleRevealContentProps) {
  const getRoleInfo = () => {
    const role = currentPlayer?.role;
    
    if (role === 'impostor') {
      return {
        borderClass: 'border-red-500/50 bg-gradient-to-br from-red-900/20 to-red-700/20',
        iconBgClass: 'bg-red-500/20',
        textClass: 'text-red-400',
        Icon: MaskIcon,
        label: dict?.reveal?.youAreImpostor || 'IMPOSTOR',
        hint: dict?.reveal?.impostorHint || "You don't know the word. Blend in!",
      };
    } else if (role === 'detective') {
      return {
        borderClass: 'border-blue-500/50 bg-gradient-to-br from-blue-900/20 to-blue-700/20',
        iconBgClass: 'bg-blue-500/20',
        textClass: 'text-blue-400',
        Icon: DetectiveIcon,
        label: dict?.reveal?.youAreDetective || 'DETECTIVE',
        hint: dict?.reveal?.detectiveHint || 'You can ask someone to say more words about the topic.',
      };
    } else if (role === 'joker') {
      return {
        borderClass: 'border-yellow-500/50 bg-gradient-to-br from-yellow-900/20 to-yellow-700/20',
        iconBgClass: 'bg-yellow-500/20',
        textClass: 'text-yellow-400',
        Icon: JokerIcon,
        label: dict?.reveal?.youAreJoker || 'JOKER',
        hint: dict?.reveal?.jokerHint || 'You know the word but want to get voted out!',
      };
    } else {
      return {
        borderClass: 'border-emerald-500/50 bg-gradient-to-br from-emerald-900/20 to-emerald-700/20',
        iconBgClass: 'bg-emerald-500/20',
        textClass: 'text-emerald-400',
        Icon: UserIcon,
        label: dict?.reveal?.youAreCivilian || 'CIVILIAN',
        hint: '',
      };
    }
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex min-h-screen flex-col items-center justify-center px-4 bg-background-light dark:bg-background-dark"
    >
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Timer */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-6xl font-bold text-primary"
        >
          {timeRemaining}
        </motion.div>

        {/* Role Card */}
        <Card variant="glass" className={`p-8 ${roleInfo.borderClass}`}>
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className={`w-24 h-24 mx-auto rounded-2xl flex items-center justify-center ${roleInfo.iconBgClass}`}
            >
              <RoleIcon size={48} className={roleInfo.textClass} />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`text-3xl font-bold ${roleInfo.textClass}`}
            >
              {roleInfo.label}
            </motion.h2>

            {/* Word (shown to everyone except impostor) */}
            {currentPlayer?.role !== 'impostor' && currentPlayer?.word && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-4 bg-white/10 rounded-xl"
              >
                <p className="text-gray-400 text-sm mb-2">{dict?.reveal?.yourWord || 'Your word'}</p>
                <p className="text-3xl font-bold text-white">{currentPlayer.word}</p>
              </motion.div>
            )}

            {/* Hint for special roles */}
            {roleInfo.hint && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-gray-400 text-sm"
              >
                {roleInfo.hint}
              </motion.p>
            )}
          </div>
        </Card>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-gray-400 animate-pulse"
        >
          {dict?.reveal?.memorize || 'Memorize your role...'}
        </motion.p>
      </div>
    </motion.div>
  );
}
