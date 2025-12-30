'use client';

import { motion } from 'framer-motion';
import { ResultBanner } from '@components/game/ResultBanner';
import { PlayerRoleCard } from '@components/game/PlayerRoleCard';
import { ActionButton } from '@components/ui/ActionButton';
import { MaskIcon, RefreshIcon } from '@components/icons';
import type { GameState } from '@/types/room';

interface Player {
  id: string;
  username: string;
  role?: string | null;
}

interface ResultsContentProps {
  players: Player[];
  currentPlayerId: string;
  gameState: Pick<GameState, 'word' | 'impostor_id' | 'detective_id' | 'joker_id' | 'most_voted_id' | 'result'>;
  isHost: boolean;
  onPlayAgain: () => void;
  dict: any;
}

export function ResultsContent({
  players,
  currentPlayerId,
  gameState,
  isHost,
  onPlayAgain,
  dict,
}: ResultsContentProps) {
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const impostor = players.find(p => p.id === gameState.impostor_id);
  
  const isImpostor = currentPlayer?.role === 'impostor';
  const isJoker = currentPlayer?.role === 'joker';
  const civiliansWon = gameState.result === 'civilians_win';
  
  // Determine if current player won
  const jokerWon = isJoker && gameState.most_voted_id === currentPlayerId;
  const impostorWon = isImpostor && !civiliansWon;
  const civilianWon = !isImpostor && !isJoker && civiliansWon;
  const playerWon = civilianWon || impostorWon || jokerWon;

  // Get title and description based on result
  const getResultText = () => {
    if (civiliansWon) {
      return {
        title: dict?.play?.civiliansWin || 'Civilians Win!',
        description: dict?.play?.civiliansWonDesc || 'The impostor has been caught!',
      };
    } else {
      return {
        title: dict?.play?.impostorWins || 'Impostor Wins!',
        description: dict?.play?.impostorWonDesc || 'The impostor fooled everyone!',
      };
    }
  };

  const resultText = getResultText();

  // Get role for each player
  const getPlayerRole = (playerId: string): 'civilian' | 'impostor' | 'detective' | 'joker' => {
    if (playerId === gameState.impostor_id) return 'impostor';
    if (playerId === gameState.detective_id) return 'detective';
    if (playerId === gameState.joker_id) return 'joker';
    return 'civilian';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark"
    >
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-32 px-6 pt-6">
        {/* Victory/Defeat Banner */}
        <ResultBanner
          playerWon={playerWon}
          title={playerWon 
            ? (dict?.play?.victory || 'VICTORY!') 
            : (dict?.play?.defeat || 'DEFEAT!')}
          description={resultText.description}
        />

        {/* The Word */}
        <div className="mt-6">
          <div className="relative overflow-hidden rounded-2xl p-5 text-center bg-surface-dark border border-white/5">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <p className="text-white/70 text-sm font-bold uppercase tracking-widest mb-2">
              {dict?.play?.theWordWas || 'The word was'}
            </p>
            <p className="text-primary tracking-tight text-4xl font-black">
              {gameState.word?.toUpperCase()}
            </p>
          </div>
        </div>

        {/* The Impostor */}
        <div className="mt-6">
          <div className="relative overflow-hidden rounded-2xl p-5 text-center bg-surface-dark border border-red-500/30">
            <p className="text-white/70 text-sm font-bold uppercase tracking-widest mb-3">
              {dict?.play?.theImpostorWas || 'The impostor was'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center">
                <MaskIcon size={28} className="text-red-400" />
              </div>
              <span className="text-2xl font-bold text-red-400">
                {impostor?.username || 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 my-6" />

        {/* All Players with Roles */}
        <div>
          <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
            <MaskIcon size={20} className="text-primary" />
            {dict?.play?.allPlayers || 'All Players'}
          </h3>
          <div className="space-y-2">
            {players.map((player) => (
              <PlayerRoleCard
                key={player.id}
                username={player.username}
                role={getPlayerRole(player.id)}
                isCurrentUser={player.id === currentPlayerId}
                wasVoted={player.id === gameState.most_voted_id}
                roleLabels={{
                  civilian: dict?.play?.civilian || 'Civilian',
                  impostor: dict?.play?.impostor || 'Impostor',
                  detective: dict?.play?.detective || 'Detective',
                  joker: dict?.play?.joker || 'Joker',
                }}
                youLabel={dict?.common?.you || 'You'}
                votedLabel={dict?.play?.voted || 'Voted'}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-dark via-background-dark to-transparent z-20">
        {isHost ? (
          <ActionButton
            onClick={onPlayAgain}
            variant="primary"
            icon={<RefreshIcon size={20} />}
          >
            {dict?.play?.playAgain || 'Play Again'}
          </ActionButton>
        ) : (
          <div className="text-center py-4">
            <p className="text-white/40 text-sm animate-pulse">
              {dict?.multiplayer?.waitingForHost || 'Waiting for host to start next round...'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
