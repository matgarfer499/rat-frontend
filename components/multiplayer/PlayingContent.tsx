'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, CheckIcon } from '@components/icons';
import { getRoleStyleInfo } from '@lib/game-utils';

interface Player {
  id: string;
  username: string;
  is_ready: boolean;
  role?: string | null;
  word?: string | null;
  wants_to_vote: boolean;
}

interface Room {
  id: string;
  host_id: string;
  players: Record<string, Player>;
  phase: string;
  game_state?: {
    word: string;
    impostor_id: string;
    detective_id?: string | null;
    joker_id?: string | null;
    starting_player_id: string;
    phase_start_time: number;
    votes_submitted: number;
  } | null;
  round_number: number;
}

interface PlayingContentProps {
  room: Room;
  currentPlayerId: string;
  timeRemaining: number;
  discussionTime: number;
  onRequestVote: () => void;
  dict: Record<string, any>;
}

export function PlayingContent({
  room,
  currentPlayerId,
  timeRemaining,
  onRequestVote,
  dict,
}: PlayingContentProps) {
  const playersList = Object.values(room.players);
  const currentPlayer = playersList.find(p => p.id === currentPlayerId);
  const wantsToVoteCount = playersList.filter(p => p.wants_to_vote).length;
  const majorityNeeded = Math.ceil(playersList.length / 2);
  const hasRequestedVote = currentPlayer?.wants_to_vote || false;
  
  // Get starting player for turn order
  const startingPlayer = room.game_state?.starting_player_id 
    ? room.players[room.game_state.starting_player_id] 
    : null;

  // Create turn order based on starting player
  const startingPlayerId = room.game_state?.starting_player_id;
  const turnOrder = useMemo(() => {
    if (!startingPlayerId) return playersList;
    
    const startIndex = playersList.findIndex(p => p.id === startingPlayerId);
    if (startIndex === -1) return playersList;
    
    return [...playersList.slice(startIndex), ...playersList.slice(0, startIndex)];
  }, [playersList, startingPlayerId]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return { mins: mins.toString().padStart(2, '0'), secs: secs.toString().padStart(2, '0') };
  };

  const time = formatTime(timeRemaining);

  // Get role info for current player using shared utility
  const roleInfo = getRoleStyleInfo(currentPlayer?.role, {
    civilian: dict?.play?.civilian,
    impostor: dict?.play?.impostor,
    detective: dict?.play?.detective,
    joker: dict?.play?.joker,
  });
  const RoleIcon = roleInfo.Icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark"
    >
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-surface-dark/50 backdrop-blur-md sticky top-0 z-10 border-b border-white/5">
        <div className="flex items-center gap-2 text-white/80">
          <ClockIcon size={20} className="text-primary" />
          <span className="text-sm font-bold tracking-wide font-mono">
            {time.mins}:{time.secs}
          </span>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
            {dict?.play?.live || 'Live'}
          </span>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-32">
        {/* Headline */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6 text-center">
          <span className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 rounded-full border border-primary/20">
            {dict?.play?.discussionPhase || 'Discussion Phase'}
          </span>
          <h1 className="text-3xl font-black leading-tight tracking-tight text-gray-900 dark:text-white mb-2">
            {dict?.play?.whoIsThe || '¿Quién es el'}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
              {dict?.play?.traitor || 'traidor'}
            </span>
            ?
          </h1>
          <p className="text-gray-500 dark:text-white/60 text-sm font-medium max-w-[280px]">
            {dict?.play?.debateHint || 'Debate with your team. When you have a clear suspect, press the button.'}
          </p>
        </div>

        {/* Your Role Card */}
        <div className="px-6 py-2">
          <div className={`relative overflow-hidden rounded-2xl bg-surface-dark border ${roleInfo.borderClass} p-4`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${roleInfo.bgClass}`}>
                <RoleIcon size={24} className={roleInfo.textClass} />
              </div>
              <div className="flex-1">
                <p className="text-gray-400 text-xs uppercase tracking-wider">{dict?.play?.youAre || 'You are'}</p>
                <p className={`text-lg font-bold ${roleInfo.textClass}`}>
                  {roleInfo.label}
                </p>
              </div>
              {currentPlayer?.role !== 'impostor' && currentPlayer?.word && (
                <div className="text-right">
                  <p className="text-gray-400 text-xs uppercase tracking-wider">{dict?.reveal?.yourWord || 'Word'}</p>
                  <p className="text-lg font-bold text-primary">{currentPlayer.word}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vote Progress Stats */}
        <div className="px-6 py-4">
          <div className="relative overflow-hidden rounded-2xl bg-surface-dark border border-white/5 p-6 text-center group">
            {/* Background accent */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
            
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-white tracking-tighter">{wantsToVoteCount}</span>
                <span className="text-2xl font-bold text-white/40">/</span>
                <span className="text-2xl font-bold text-white/40">{playersList.length}</span>
              </div>
              <p className="text-primary font-bold text-sm uppercase tracking-wide">
                {dict?.play?.playersReady || 'Players Ready'}
              </p>
              
              {/* Progress Bar */}
              <div className="w-full h-2 bg-black/40 rounded-full mt-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(wantsToVoteCount / playersList.length) * 100}%` }}
                  className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full shadow-[0_0_10px_rgba(13,89,242,0.5)]"
                />
              </div>
              <p className="text-xs text-white/40 mt-2">
                {dict?.play?.majorityNeeded || 'Majority needed to start voting'} ({majorityNeeded})
              </p>
            </div>
          </div>
        </div>

        {/* Current Speaker Spotlight */}
        {startingPlayer && (
          <div className="px-6 py-4">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 ml-1">
              {dict?.play?.currentSpeaker || 'Current Speaker'}
            </h3>
            <div className="flex flex-col items-center justify-center relative py-8">
              {/* Radar effect */}
              <div className="absolute w-[200px] h-[200px] border border-white/5 rounded-full pointer-events-none" />
              <div className="absolute w-[140px] h-[140px] border border-white/5 rounded-full pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center">
                {/* Status Badge */}
                <div className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg border border-primary/50 whitespace-nowrap mb-3">
                  {dict?.play?.hasTheWord || 'Has the word'}
                </div>
                
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-b from-primary to-transparent animate-pulse">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/80 to-purple-600 border-4 border-surface-dark flex items-center justify-center text-white font-bold text-3xl">
                    {startingPlayer.username.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <h3 className="text-2xl font-bold text-white">{startingPlayer.username}</h3>
                  <p className="text-primary/80 text-sm font-medium mt-1">
                    {dict?.play?.startingAccusation || 'Starting accusation...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Turn Order / Avatar Grid */}
        <div className="px-6 py-2">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 ml-1">
            {dict?.play?.crewStatus || 'Crew Status'}
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {turnOrder.map((player, index) => {
              const isCurrentUser = player.id === currentPlayerId;
              const hasVoteRequest = player.wants_to_vote;
              
              return (
                <div key={player.id} className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-full p-0.5 transition-all ${
                      hasVoteRequest 
                        ? 'border-2 border-primary shadow-[0_0_15px_rgba(13,89,242,0.4)]' 
                        : 'border-2 border-white/10 grayscale opacity-50'
                    }`}>
                      <div className={`w-full h-full rounded-full bg-gradient-to-br from-primary/80 to-purple-600 flex items-center justify-center text-white font-bold text-lg ${
                        !hasVoteRequest ? 'opacity-50' : ''
                      }`}>
                        {player.username.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    {hasVoteRequest && (
                      <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full border-2 border-background-dark shadow-sm">
                        <CheckIcon size={10} />
                      </div>
                    )}
                    {/* Turn order number */}
                    <div className="absolute -left-1 -top-1 w-5 h-5 bg-background-dark rounded-full flex items-center justify-center border border-white/10">
                      <span className="text-[10px] text-white font-bold">{index + 1}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-medium truncate max-w-full ${
                    isCurrentUser 
                      ? 'text-primary font-bold' 
                      : hasVoteRequest 
                        ? 'text-white/80' 
                        : 'text-white/40'
                  }`}>
                    {isCurrentUser ? (dict?.common?.you || 'You') : player.username}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-dark via-background-dark to-transparent z-20">
        {hasRequestedVote ? (
          <div className="w-full">
            <div className="w-full h-14 rounded-full bg-surface-dark border border-primary/30 flex items-center justify-center gap-2 text-primary font-bold">
              <CheckIcon size={20} />
              {dict?.play?.voteRequested || 'Vote Requested'} ({wantsToVoteCount}/{playersList.length})
            </div>
            <p className="text-center text-xs text-white/30 mt-3 font-medium">
              {dict?.play?.waitingForOthers || 'Waiting for others...'}
            </p>
          </div>
        ) : (
          <>
            <button
              onClick={onRequestVote}
              className="relative w-full group overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-4 focus:ring-primary/30"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#0d59f2_0%,#000000_50%,#0d59f2_100%)]" />
              <span className="relative flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-bold text-white transition-all group-hover:bg-[#0b4ccb] group-active:scale-[0.98]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                  <path d="M18 13h-.68l-2 2h1.91L19 17H5l1.78-2h2.05l-2-2H6l-3 3v4c0 1.1.89 2 1.99 2H19c1.1 0 2-.89 2-2v-4l-3-3zm-1-5.05l-4.95 4.95-3.54-3.54 4.95-4.95L17 7.95zm-4.24-5.66L6.39 8.66a.996.996 0 0 0 0 1.41l4.95 4.95c.39.39 1.02.39 1.41 0l6.36-6.36a.996.996 0 0 0 0-1.41L14.16 2.3c-.38-.4-1.01-.4-1.4-.01z"/>
                </svg>
                {dict?.play?.readyToVote || 'Ready to Vote'}
              </span>
            </button>
            <p className="text-center text-xs text-white/30 mt-3 font-medium">
              {dict?.play?.cannotUndo || 'This action cannot be undone'}
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}
