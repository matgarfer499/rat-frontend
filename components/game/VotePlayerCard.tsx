'use client';

import { UserIcon, CheckIcon } from '@components/icons';

interface VotePlayerCardProps {
  playerId: string;
  username: string;
  index: number;
  isSelected: boolean;
  isDisabled: boolean;
  isCurrentUser?: boolean;
  onSelect: (playerId: string) => void;
  suspectLabel?: string;
  youLabel?: string;
}

export function VotePlayerCard({
  playerId,
  username,
  index,
  isSelected,
  isDisabled,
  isCurrentUser = false,
  onSelect,
  suspectLabel = 'Suspect',
  youLabel = 'You',
}: VotePlayerCardProps) {
  const initial = username.charAt(0).toUpperCase();

  return (
    <button
      onClick={() => !isDisabled && onSelect(playerId)}
      disabled={isDisabled}
      className={`group relative flex items-center gap-4 rounded-2xl border p-3 pr-4 shadow-sm transition-all w-full text-left ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(13,89,242,0.15)]'
          : isDisabled
            ? 'border-transparent bg-white/5 dark:bg-[#1e293b]/50 opacity-50 cursor-not-allowed'
            : 'border-transparent bg-white dark:bg-[#1e293b] hover:border-primary/30 cursor-pointer'
      }`}
    >
      {/* Avatar */}
      <div className="relative">
        <div className={`h-12 w-12 rounded-full bg-gradient-to-br from-primary/80 to-purple-600 border-2 flex items-center justify-center text-white font-bold text-lg transition-colors ${
          isSelected 
            ? 'border-primary' 
            : 'border-white dark:border-[#2a3649]'
        }`}>
          {initial}
        </div>
        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#2a3649] border border-[#1e293b] text-[10px] font-bold text-white">
          {index + 1}
        </div>
      </div>

      {/* Info */}
      <div className="flex grow flex-col">
        <p className={`text-sm font-bold transition-colors ${
          isSelected 
            ? 'text-primary' 
            : 'text-slate-900 dark:text-white'
        }`}>
          {username}
          {isCurrentUser && (
            <span className="ml-2 text-xs text-primary/70">({youLabel})</span>
          )}
        </p>
        <span className={`text-xs transition-colors ${
          isSelected 
            ? 'text-primary/70' 
            : 'text-slate-500 dark:text-slate-400'
        }`}>
          {suspectLabel}
        </span>
      </div>

      {/* Selection indicator */}
      <div className="relative flex items-center justify-center">
        <div className={`h-6 w-6 rounded-full border-2 transition-all flex items-center justify-center ${
          isSelected 
            ? 'border-primary bg-primary' 
            : 'border-slate-300 dark:border-slate-600'
        }`}>
          {isSelected && (
            <CheckIcon size={14} className="text-white" />
          )}
        </div>
      </div>
    </button>
  );
}
