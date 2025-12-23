import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserIcon, ClockIcon, CheckIcon } from '@components/icons';
import { Player } from '@lib/types';
import { formatTime } from '@lib/game-utils';

interface VotingPhaseProps {
  players: Player[];
  remainingTime: number;
  onConfirmVote: (votedPlayerId: string | null) => void;
  dict: {
    votingInProgress: string;
    whoIsMrWhite: string;
    votingInstructions: string;
    timeRemaining: string;
    skipVote: string;
    skipVoteDesc: string;
    confirmVote: string;
    cannotVoteSelf: string;
    suspect: string;
  };
}

export function VotingPhase({ 
  players, 
  remainingTime, 
  onConfirmVote, 
  dict 
}: VotingPhaseProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const { minutes, seconds } = formatTime(remainingTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmVote(selectedPlayerId);
  };

  return (
    <motion.div
      key="voting"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col w-full h-full"
    >
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Timer Section */}
        <div className="mt-2 mb-6">
          <div className="relative flex flex-col items-center justify-center py-6">
            {/* Timer Pulse Effect Background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-32 w-32 rounded-full bg-primary/10 animate-pulse blur-xl" />
            </div>
            <div className="relative flex flex-col items-center gap-1 z-10">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tighter tabular-nums text-white">
                  {minutes}:{seconds}
                </span>
              </div>
              <p className="text-sm font-medium text-red-400 flex items-center gap-1 animate-pulse">
                <ClockIcon size={16} />
                {dict.timeRemaining}
              </p>
            </div>
          </div>
        </div>

        {/* Headline & Instructions */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold leading-tight mb-2">{dict.whoIsMrWhite}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed px-4">
            {dict.votingInstructions}
          </p>
        </div>

        {/* Voting Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-4">
          {players.map((player, index) => (
            <label
              key={player.id}
              className="group relative flex items-center gap-4 rounded-2xl border border-transparent 
                         bg-white dark:bg-[#1e293b] p-3 pr-4 shadow-sm transition-all 
                         hover:border-primary/30 has-[:checked]:border-primary 
                         has-[:checked]:bg-primary/5 has-[:checked]:shadow-[0_0_20px_rgba(13,89,242,0.15)] 
                         cursor-pointer select-none"
            >
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-blue-400/20 
                               border-2 border-white dark:border-[#2a3649] group-has-[:checked]:border-primary 
                               transition-colors flex items-center justify-center">
                  <UserIcon size={24} className="text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center 
                               rounded-full bg-[#2a3649] border border-[#1e293b] text-[10px] 
                               font-bold text-white">
                  {index + 1}
                </div>
              </div>
              <div className="flex grow flex-col">
                <p className="text-sm font-bold text-slate-900 dark:text-white 
                             group-has-[:checked]:text-primary transition-colors">
                  {player.name}
                </p>
                <span className="text-xs text-slate-500 dark:text-slate-400 
                               group-has-[:checked]:text-primary/70">
                  {dict.suspect}
                </span>
              </div>
              <div className="relative flex items-center justify-center">
                <input
                  className="peer h-6 w-6 appearance-none rounded-full border-2 
                           border-slate-300 dark:border-slate-600 checked:border-primary 
                           checked:bg-primary transition-all focus:ring-0 focus:ring-offset-0"
                  name="suspect"
                  type="radio"
                  value={player.id}
                  checked={selectedPlayerId === player.id}
                  onChange={(e) => setSelectedPlayerId(e.target.value)}
                />
                <CheckIcon 
                  size={16} 
                  className="absolute text-white opacity-0 peer-checked:opacity-100 
                           pointer-events-none transition-opacity duration-200" 
                />
              </div>
            </label>
          ))}
        </form>
      </div>

      {/* Bottom Action Bar (Sticky) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 
                     bg-gradient-to-t from-background-dark via-background-dark to-transparent 
                     pt-12 pb-6 px-6">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={!selectedPlayerId}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-full bg-primary 
                   text-center text-base font-bold text-white 
                   shadow-[0_4px_20px_rgba(13,89,242,0.4)] active:scale-[0.98] 
                   transition-all hover:bg-blue-600 hover:shadow-[0_8px_25px_rgba(13,89,242,0.5)]
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <CheckIcon size={20} />
          {dict.confirmVote}
        </button>
      </div>
    </motion.div>
  );
}
