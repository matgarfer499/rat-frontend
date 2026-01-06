'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '@lib/types';
import { useDictionary } from '@hooks/use-dictionary';
import { useCountdown } from '@hooks/use-countdown';
import { DiscussionTimer, PlayerCard, VotingPhase, RevealPhase } from '@components/game';
import { PlayIcon } from '@components/icons';
import { ActionButton } from '@components/ui/ActionButton';

type GamePhase = 'discussion' | 'voting' | 'reveal';

export default function PlayPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const dict = useDictionary();
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameWord, setGameWord] = useState<string>('');
  const [impostorIds, setImpostorIds] = useState<string[]>([]);
  const [detectiveId, setDetectiveId] = useState<string | null>(null);
  const [jokerId, setJokerId] = useState<string | null>(null);
  const [phase, setPhase] = useState<GamePhase>('discussion');
  const [startingPlayerIndex, setStartingPlayerIndex] = useState<number>(0);
  const [votedPlayerId, setVotedPlayerId] = useState<string | null>(null);
  
  // Game rules from setup
  const [discussionTimerEnabled, setDiscussionTimerEnabled] = useState(false);
  const [discussionTime, setDiscussionTime] = useState(300);
  
  // Timer with custom hook
  const countdown = useCountdown(discussionTime);

  useEffect(() => {
    const playersData = sessionStorage.getItem('gamePlayers');
    const word = sessionStorage.getItem('gameWord');
    const impostorsData = sessionStorage.getItem('impostorIds');

    if (!playersData || !word || !impostorsData) {
      router.push(`/${lang}/setup`);
      return;
    }

    const parsedPlayers = JSON.parse(playersData);
    const parsedImpostorIds = JSON.parse(impostorsData);
    setPlayers(parsedPlayers);
    setGameWord(word);
    setImpostorIds(parsedImpostorIds);
    // Select random starting player
    setStartingPlayerIndex(Math.floor(Math.random() * parsedPlayers.length));
    
    // Load special roles
    const storedDetectiveId = sessionStorage.getItem('detectiveId');
    const storedJokerId = sessionStorage.getItem('jokerId');
    if (storedDetectiveId) setDetectiveId(storedDetectiveId);
    if (storedJokerId) setJokerId(storedJokerId);
    
    // Load game rules
    const storedDiscussionEnabled = sessionStorage.getItem('discussionTimerEnabled');
    const storedDiscussionTime = sessionStorage.getItem('discussionTime');
    
    if (storedDiscussionEnabled) {
      const enabled = storedDiscussionEnabled === 'true';
      setDiscussionTimerEnabled(enabled);
      if (enabled && storedDiscussionTime) {
        const time = parseInt(storedDiscussionTime, 10);
        setDiscussionTime(time);
        countdown.reset(time);
        countdown.start();
      }
    }
  }, [router, lang]);

  const handleStartVoting = () => {
    countdown.stop();
    setPhase('voting');
  };

  const handleConfirmVote = (playerId: string | null) => {
    setVotedPlayerId(playerId === 'skip' ? null : playerId);
    setPhase('reveal');
  };

  const handlePlayAgain = () => {
    // Keep players but clear game state, go to categories
    const currentPlayers = players.map(({ id, name }) => ({ id, name }));
    sessionStorage.setItem('gamePlayers', JSON.stringify(currentPlayers));
    sessionStorage.removeItem('gameWord');
    sessionStorage.removeItem('impostorIds');
    sessionStorage.removeItem('selectedCategories');
    router.push(`/${lang}/categories`);
  };

  const handleBackToLobby = () => {
    sessionStorage.clear();
    router.push(`/${lang}`);
  };

  if (players.length === 0 || !dict) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-purple-light text-xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex min-h-screen flex-col items-center"
    >
      {/* Background gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 dark:opacity-10 
                      bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] 
                      from-primary via-background-dark to-background-dark" />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-md px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Phase: Discussion */}
          {phase === 'discussion' && (
            <motion.div
              key="discussion"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-8 w-full"
            >
              {/* Timer Section - Only if enabled */}
              {discussionTimerEnabled && (
                <DiscussionTimer
                  remainingTime={countdown.remainingTime}
                  minutesLabel={dict.play.minutes || 'Minutos'}
                  secondsLabel={dict.play.seconds || 'Segundos'}
                />
              )}

              {/* Context Text */}
              <div className="flex flex-col items-center text-center gap-2 mt-4">
                <h3 className="text-gray-900 dark:text-white tracking-tight text-xl font-bold leading-tight">
                  {dict.play.startsFirst}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {dict.play.discussionHint}
                </p>
              </div>

              {/* Player Card */}
              <PlayerCard
                playerName={players[startingPlayerIndex]?.name}
              />
            </motion.div>
          )}

          {/* Phase: Voting */}
          {phase === 'voting' && (
            <VotingPhase
              players={players}
              remainingTime={countdown.remainingTime}
              onConfirmVote={handleConfirmVote}
              dict={{
                votingInProgress: dict.play.votingInProgress || 'Votación en curso',
                whoIsMrWhite: dict.play.whoIsImpostor,
                votingInstructions: dict.play.votingInstructions || 'Analiza el comportamiento y vota para eliminar al sospechoso.',
                timeRemaining: dict.play.timeRemaining || 'Tiempo restante',
                skipVote: dict.play.skipVote || 'Saltar Voto',
                skipVoteDesc: dict.play.skipVoteDesc || 'Abstenerse en esta ronda',
                confirmVote: dict.play.confirmVote || 'Confirmar Voto',
                cannotVoteSelf: dict.play.cannotVoteSelf || 'No puedes votarte a ti mismo',
                suspect: dict.play.suspect || 'Sospechoso',
              }}
            />
          )}

          {/* Phase: Reveal */}
          {phase === 'reveal' && (
            <RevealPhase
              players={players}
              gameWord={gameWord}
              impostorIds={impostorIds}
              detectiveId={detectiveId}
              jokerId={jokerId}
              votedPlayerId={votedPlayerId}
              onPlayAgain={handlePlayAgain}
              onBackToLobby={handleBackToLobby}
              dict={{
                results: dict.play.results || 'Resultados',
                civiliansWin: dict.play.civiliansWin || '¡Ganan los Civiles!',
                impostorWins: dict.play.impostorWins || '¡Gana el Impostor!',
                jokerWins: dict.play.jokerWins || '¡Gana el Joker!',
                civiliansWinDesc: dict.play.civiliansWinDesc || 'Descubrieron al impostor antes de que se acabara el tiempo.',
                impostorWinsDesc: dict.play.impostorWinsDesc || 'El impostor logró engañar a todos.',
                jokerWinsDesc: dict.play.jokerWinsDesc || 'El joker fue descubierto y gana la partida.',
                theWordWas: dict.play.theWordWas || 'La Palabra Era',
                rolesRevealed: dict.play.rolesRevealed || 'Roles Revelados',
                playAgainSamePlayers: dict.play.playAgainSamePlayers,
                backToLobby: dict.play.backToLobby,
                civilian: dict.play.civilian,
                impostor: dict.play.impostor,
                detective: dict.play.detective,
                joker: dict.play.joker,
                captured: dict.play.captured || 'Capturado',
                survivor: dict.play.survivor || 'Sobreviviente',
                eliminated: dict.play.eliminated || 'Eliminado',
                youLabel: dict.play.youLabel || 'Tú',
              }}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Action Button - Only for discussion phase */}
      {phase === 'discussion' && (
        <footer className="relative z-10 p-6 pb-8 w-full max-w-md mx-auto">
          <ActionButton
            onClick={handleStartVoting}
            variant="primary"
            icon={<PlayIcon size={24} />}
          >
            {dict.play.startVoting}
          </ActionButton>
        </footer>
      )}

      <footer className="h-8" />
    </motion.div>
  );
}
