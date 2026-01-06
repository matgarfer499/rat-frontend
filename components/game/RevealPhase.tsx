import { motion } from 'framer-motion';
import { RefreshIcon, HomeIcon, MaskIcon } from '@components/icons';
import { Player } from '@lib/types';
import { ActionButton } from '@components/ui/ActionButton';
import { PlayerRoleCard } from './PlayerRoleCard';

interface RevealPhaseProps {
  players: Player[];
  gameWord: string;
  impostorIds: string[];
  detectiveId: string | null;
  jokerId: string | null;
  votedPlayerId: string | null;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
  dict: {
    results: string;
    civiliansWin: string;
    impostorWins: string;
    jokerWins: string;
    civiliansWinDesc: string;
    impostorWinsDesc: string;
    jokerWinsDesc: string;
    theWordWas: string;
    rolesRevealed: string;
    playAgainSamePlayers: string;
    backToLobby: string;
    civilian: string;
    impostor: string;
    detective?: string;
    joker?: string;
    captured: string;
    survivor: string;
    eliminated: string;
    youLabel: string;
  };
}

export function RevealPhase({
  players,
  gameWord,
  impostorIds,
  detectiveId,
  jokerId,
  votedPlayerId,
  onPlayAgain,
  onBackToLobby,
  dict,
}: RevealPhaseProps) {  
  // Determine winner based on who was voted
  const votedPlayerIsImpostor = votedPlayerId ? impostorIds.includes(votedPlayerId) : false;
  const votedPlayerIsJoker = votedPlayerId === jokerId;
  const votedPlayerIsCivilian = votedPlayerId && !votedPlayerIsImpostor && !votedPlayerIsJoker;
  
  let winnerTitle = dict.civiliansWin;
  let winnerDesc = dict.civiliansWinDesc;
  let iconColor = 'text-yellow-400';
  
  if (votedPlayerIsJoker || !votedPlayerId) {
    // Joker wins if voted, or if no one was voted
    winnerTitle = dict.jokerWins;
    winnerDesc = dict.jokerWinsDesc;
    iconColor = 'text-orange-400';
  } else if (votedPlayerIsCivilian) {
    // Impostor wins if civilian was voted
    winnerTitle = dict.impostorWins;
    winnerDesc = dict.impostorWinsDesc;
    iconColor = 'text-red-400';
  }

  const getPlayerRole = (playerId: string): 'civilian' | 'impostor' | 'detective' | 'joker' => {
    if (impostorIds.includes(playerId)) return 'impostor';
    if (playerId === detectiveId) return 'detective';
    if (playerId === jokerId) return 'joker';
    return 'civilian';
  };

  return (
    <motion.div
      key="reveal"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col w-full h-full"
    >
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Victory Illustration */}
        <div className="flex w-full p-4 justify-center">
          <div className="w-full max-w-[320px] aspect-[4/3] rounded-xl flex overflow-hidden shadow-lg relative">
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-blue-500/20 to-purple-500/20">
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent 
                             flex items-center justify-center">
                <span className={`text-8xl drop-shadow-lg ${iconColor}`}>🏆</span>
              </div>
            </div>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-white tracking-tight text-[32px] font-extrabold leading-tight px-4 text-center pb-2">
          {winnerTitle}
        </h1>
        <p className="text-white/60 text-sm text-center px-4 pb-6 font-medium">
          {winnerDesc}
        </p>

        {/* Secret Word Card */}
        <div className="px-4 pb-6">
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1a2332] 
                         shadow-sm border border-gray-200 dark:border-[#314368] text-center 
                         relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <p className="text-gray-700 dark:text-white/70 text-sm font-bold uppercase tracking-widest 
                         leading-normal mb-1">
              {dict.theWordWas}
            </p>
            <p className="text-primary tracking-tight text-4xl font-black leading-tight">
              {gameWord.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 dark:bg-[#314368] mx-4 mb-6" />

        {/* Roles Header */}
        <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-4 
                      flex items-center gap-2">
          <span className="text-primary text-2xl">
            <MaskIcon></MaskIcon>
          </span>
          {dict.rolesRevealed}
        </h3>

        {/* Player List */}
        <div className="flex flex-col gap-2 px-4">
          {players.map((player) => (
            <PlayerRoleCard
              key={player.id}
              username={player.name}
              role={getPlayerRole(player.id)}
              wasVoted={player.id === votedPlayerId}
              roleLabels={{
                civilian: dict.civilian,
                impostor: dict.impostor,
                detective: dict.detective,
                joker: dict.joker,
              }}
            />
          ))}
        </div>
      </div>

      {/* Sticky Footer Actions */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-background-light/90 
                     dark:bg-background-dark/90 backdrop-blur-md border-t border-[#e5e7eb] 
                     dark:border-[#314368] flex flex-col gap-3 z-20">
        <ActionButton
          onClick={onPlayAgain}
          variant="primary"
          icon={<RefreshIcon size={20} />}
        >
          {dict.playAgainSamePlayers}
        </ActionButton>
        <ActionButton
          onClick={onBackToLobby}
          variant="secondary"
          icon={<HomeIcon size={20} />}
        >
          {dict.backToLobby}
        </ActionButton>
      </div>
    </motion.div>
  );
}
