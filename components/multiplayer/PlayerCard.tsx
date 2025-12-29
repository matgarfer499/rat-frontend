'use client';

import { motion } from 'framer-motion';
import { CheckIcon, MoreVertIcon, CrownIcon } from '@components/icons';

interface Player {
  id: string;
  username: string;
  is_ready: boolean;
}

interface PlayerCardProps {
  player: Player;
  isHost: boolean;
  isCurrentUser: boolean;
  isRoomHost: boolean;
  onKick?: (playerId: string) => void;
}

export function PlayerCard({ 
  player, 
  isHost, 
  isCurrentUser, 
  isRoomHost,
  onKick 
}: PlayerCardProps) {
  const initial = player.username.charAt(0).toUpperCase();
  const showActions = isRoomHost && !isCurrentUser && !isHost;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex items-center gap-4 bg-white dark:bg-[#182234] p-3 rounded-2xl border border-gray-100 dark:border-[#314368] shadow-sm relative overflow-hidden ${
        !player.is_ready ? 'opacity-70' : ''
      }`}
    >
      {/* Ready indicator bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        player.is_ready ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
      }`} />
      
      {/* Avatar */}
      <div className="relative">
        <div className={`bg-gradient-to-br from-primary/80 to-purple-600 rounded-full h-12 w-12 flex items-center justify-center text-white font-bold text-lg ${
          player.is_ready ? 'ring-2 ring-green-500' : 'ring-1 ring-gray-200 dark:ring-gray-700 grayscale'
        }`}>
          {initial}
        </div>
        {isHost && (
          <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-1 shadow-sm border-2 border-white dark:border-[#101622]">
            <CrownIcon size={10} />
          </div>
        )}
      </div>

      {/* Player info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-gray-900 dark:text-white text-base font-bold truncate">
            {player.username}
            {isCurrentUser && ' (You)'}
          </p>
          {isHost && (
            <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
              Host
            </span>
          )}
        </div>
        <p className={`text-xs font-medium ${
          player.is_ready 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-gray-500'
        }`}>
          {player.is_ready ? 'Ready' : 'Waiting...'}
        </p>
      </div>

      {/* Status icon */}
      <div className="shrink-0">
        {player.is_ready ? (
          <CheckIcon size={24} className="text-green-500" />
        ) : (
          <div className="animate-pulse">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            </div>
          </div>
        )}
      </div>

      {/* Actions menu (only for host, not on themselves or other host) */}
      {showActions && (
        <button
          onClick={() => onKick?.(player.id)}
          className="shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <MoreVertIcon size={20} className="text-gray-400" />
        </button>
      )}
    </motion.div>
  );
}
