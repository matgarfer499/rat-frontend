'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '@lib/types';
import { useDictionary } from '@hooks/use-dictionary';
import { LanguageSelector } from '@components/layout/LanguageSelector';
import { CountdownTimer } from '@components/game';
import { Button } from '@components/button';
import { Card } from '@components/ui';
import { PlayIcon, StopIcon, RefreshIcon, MaskIcon, HomeIcon, UserIcon } from '@components/icons';

type GamePhase = 'discussion' | 'voting' | 'reveal';

export default function PlayPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const dict = useDictionary();
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameWord, setGameWord] = useState<string>('');
  const [impostorId, setImpostorId] = useState<string>('');
  const [phase, setPhase] = useState<GamePhase>('discussion');
  const [startingPlayerIndex, setStartingPlayerIndex] = useState<number>(0);
  
  // Game rules from setup
  const [votingTime, setVotingTime] = useState(60);
  const [discussionTimerEnabled, setDiscussionTimerEnabled] = useState(false);
  const [discussionTime, setDiscussionTime] = useState(300);

  useEffect(() => {
    const playersData = sessionStorage.getItem('gamePlayers');
    const word = sessionStorage.getItem('gameWord');
    const impostor = sessionStorage.getItem('impostorId');

    if (!playersData || !word || !impostor) {
      router.push(`/${lang}/setup`);
      return;
    }

    const parsedPlayers = JSON.parse(playersData);
    setPlayers(parsedPlayers);
    setGameWord(word);
    setImpostorId(impostor);
    // Select random starting player
    setStartingPlayerIndex(Math.floor(Math.random() * parsedPlayers.length));
    
    // Load game rules
    const storedVotingTime = sessionStorage.getItem('votingTime');
    const storedDiscussionEnabled = sessionStorage.getItem('discussionTimerEnabled');
    const storedDiscussionTime = sessionStorage.getItem('discussionTime');
    
    if (storedVotingTime) setVotingTime(parseInt(storedVotingTime, 10));
    if (storedDiscussionEnabled) setDiscussionTimerEnabled(storedDiscussionEnabled === 'true');
    if (storedDiscussionTime) setDiscussionTime(parseInt(storedDiscussionTime, 10));
  }, [router, lang]);

  const handleStartVoting = () => {
    setPhase('voting');
  };

  const handleEndVoting = useCallback(() => {
    setPhase('reveal');
  }, []);

  const handlePlayAgain = () => {
    // Keep players but clear game state, go to categories
    const currentPlayers = players.map(({ id, name }) => ({ id, name }));
    sessionStorage.setItem('gamePlayers', JSON.stringify(currentPlayers));
    sessionStorage.removeItem('gameWord');
    sessionStorage.removeItem('impostorId');
    sessionStorage.removeItem('selectedCategories');
    router.push(`/${lang}/categories`);
  };

  const handleBackToLobby = () => {
    sessionStorage.clear();
    router.push(`/${lang}`);
  };

  const impostorPlayer = players.find((p) => p.id === impostorId);

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
      className="flex min-h-screen flex-col items-center px-4 py-6 sm:py-8"
    >
      {/* Header */}
      <header className="w-full max-w-md flex justify-end mb-6">
        <LanguageSelector />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
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
              <div className="text-center">
                <h1 className="text-3xl font-bold text-cyan-accent mb-2">{dict.play.discussionPhase}</h1>
                <p className="text-gray-muted">{dict.play.discussionDesc}</p>
              </div>

              {/* Starting player indicator */}
              <Card variant="glass" className="w-full p-6 text-center">
                <p className="text-gray-muted text-sm mb-2">{dict.play.startsFirst}</p>
                <div className="flex items-center justify-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    className="w-12 h-12 rounded-full bg-cyan-accent/20 border-2 border-cyan-accent/50
                                flex items-center justify-center"
                  >
                    <UserIcon size={24} className="text-cyan-accent" />
                  </motion.div>
                  <span className="text-3xl font-bold text-cyan-accent">
                    {players[startingPlayerIndex]?.name}
                  </span>
                </div>
              </Card>

              <p className="text-gray-muted text-sm text-center max-w-xs">
                {dict.play.discussionHint}
              </p>

              {/* Discussion timer if enabled */}
              {discussionTimerEnabled && (
                <CountdownTimer
                  seconds={discussionTime}
                  onComplete={handleStartVoting}
                  isRunning={true}
                />
              )}

              {/* Start voting button */}
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartVoting}
                className="flex items-center gap-2"
              >
                <PlayIcon size={20} />
                {dict.play.startVoting}
              </Button>
            </motion.div>
          )}

          {/* Phase: Voting */}
          {phase === 'voting' && (
            <motion.div
              key="voting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-8 w-full"
            >
              <div className="text-center">
                <h1 className="text-3xl font-bold text-yellow-glow mb-2">{dict.play.votingPhase}</h1>
                <p className="text-gray-muted">{dict.play.votingDesc}</p>
              </div>

              {/* Countdown timer */}
              <CountdownTimer
                seconds={votingTime}
                onComplete={handleEndVoting}
                isRunning={true}
              />

              {/* End voting button */}
              <Button
                variant="secondary"
                size="lg"
                onClick={handleEndVoting}
                className="flex items-center gap-2"
              >
                <StopIcon size={20} />
                {dict.play.endVoting}
              </Button>
              <p className="text-gray-muted text-sm">{dict.play.endVotingDesc}</p>
            </motion.div>
          )}

          {/* Phase: Reveal */}
          {phase === 'reveal' && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-6 w-full"
            >
              <h1 className="text-3xl font-bold text-yellow-glow">{dict.play.gameOver}</h1>

              {/* The word */}
              <Card variant="glass" className="w-full p-6 text-center">
                <p className="text-gray-muted text-sm mb-2">{dict.play.theWordWas}</p>
                <p className="text-4xl font-bold text-cyan-accent">{gameWord}</p>
              </Card>

              {/* The impostor */}
              <Card variant="glass" className="w-full p-6 text-center border-red-500/50">
                <p className="text-gray-muted text-sm mb-3">{dict.play.theImpostorWas}</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 border-2 border-red-500/50
                                  flex items-center justify-center">
                    <MaskIcon size={24} className="text-red-400" />
                  </div>
                  <span className="text-3xl font-bold text-red-400">{impostorPlayer?.name}</span>
                </div>
              </Card>

              {/* All players list */}
              <Card variant="glass" className="w-full p-4">
                <div className="space-y-2">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        player.id === impostorId
                          ? 'bg-red-500/10 border border-red-500/30'
                          : 'bg-emerald-500/10 border border-emerald-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <UserIcon
                          size={18}
                          className={player.id === impostorId ? 'text-red-400' : 'text-emerald-400'}
                        />
                        <span className="text-white font-medium">{player.name}</span>
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          player.id === impostorId ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {player.id === impostorId ? dict.play.impostor : dict.play.civilian}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Action buttons */}
              <div className="w-full space-y-3 mt-4">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handlePlayAgain}
                  className="flex items-center justify-center gap-2"
                >
                  <RefreshIcon size={20} />
                  {dict.play.playAgainSamePlayers}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={handleBackToLobby}
                  className="flex items-center justify-center gap-2"
                >
                  <HomeIcon size={20} />
                  {dict.play.backToLobby}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="h-8" />
    </motion.div>
  );
}
