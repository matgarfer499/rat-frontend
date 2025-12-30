'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { VotingTimer } from '@components/game/VotingTimer';
import { VotePlayerCard } from '@components/game/VotePlayerCard';
import { ActionButton } from '@components/ui/ActionButton';
import { CheckIcon } from '@components/icons';

interface Player {
  id: string;
  username: string;
  vote?: string | null;
}

interface VotingContentProps {
  players: Player[];
  currentPlayerId: string;
  timeRemaining: number;
  votesSubmitted: number;
  hasVoted: boolean;
  selectedVote: string;
  onVote: (playerId: string) => void;
  dict: any;
}

export function VotingContent({
  players,
  currentPlayerId,
  timeRemaining,
  votesSubmitted,
  hasVoted,
  selectedVote,
  onVote,
  dict,
}: VotingContentProps) {
  const otherPlayers = players.filter(p => p.id !== currentPlayerId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark"
    >
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Timer */}
        <div className="mt-2 mb-4">
          <VotingTimer
            timeRemaining={timeRemaining}
            label={dict?.play?.secondsToVote || 'seconds to vote'}
            urgentThreshold={10}
          />
        </div>

        {/* Headline */}
        <div className="text-center mb-4 px-6">
          <span className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-widest text-red-400 uppercase bg-red-500/10 rounded-full border border-red-500/20">
            {dict?.play?.votingPhase || 'Voting Phase'}
          </span>
          <h2 className="text-2xl font-bold leading-tight text-white mb-2">
            {dict?.play?.whoIsImpostor || 'Who is the impostor?'}
          </h2>
          <p className="text-white/60 text-sm">
            {dict?.play?.voteInstructions || 'Select who you think is the traitor'}
          </p>
        </div>

        {/* Vote Progress */}
        <div className="px-6 mb-6">
          <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-surface-dark border border-white/5">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary">{votesSubmitted}</span>
              <span className="text-white/40">/</span>
              <span className="text-white/40">{players.length}</span>
            </div>
            <span className="text-sm text-white/60">{dict?.play?.votesSubmitted || 'votes'}</span>
          </div>
        </div>

        {/* Player List */}
        <div className="flex flex-col gap-3 px-6">
          {otherPlayers.map((player, index) => (
            <VotePlayerCard
              key={player.id}
              playerId={player.id}
              username={player.username}
              index={index}
              isSelected={selectedVote === player.id}
              isDisabled={hasVoted}
              onSelect={onVote}
              suspectLabel={dict?.play?.suspect || 'Suspect'}
            />
          ))}
        </div>

        {/* Vote Confirmation Message */}
        {hasVoted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 mx-6"
          >
            <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <CheckIcon size={20} className="text-emerald-400" />
              <span className="text-emerald-400 font-medium">
                {dict?.play?.voteSubmitted || 'Vote submitted'}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Sticky Bottom - Show waiting message after voting */}
      {hasVoted && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-dark via-background-dark to-transparent z-20">
          <div className="text-center">
            <p className="text-white/40 text-sm animate-pulse">
              {dict?.play?.waitingForVotes || 'Waiting for other players to vote...'}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
