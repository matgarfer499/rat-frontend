'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Player, PlayerRole } from '@lib/types';
import { getRandomWord } from '@lib/api';
import { useDictionary } from '@hooks/use-dictionary';
import { LanguageSelector } from '@components/layout/LanguageSelector';
import { RevealCard, RoleDisplay, PlayerProgress } from '@components/game';
import { Button } from '@components/button';
import { Card } from '@components/ui';
import { ArrowRightIcon, UserIcon } from '@components/icons';

export default function RevealPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const dict = useDictionary();
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [gameWord, setGameWord] = useState<string | null>(null);
  const [impostorId, setImpostorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeGame = async () => {
      const gameLang = sessionStorage.getItem('gameLanguage') || 'en';
      const playersData = sessionStorage.getItem('gamePlayers');
      const categoriesData = sessionStorage.getItem('selectedCategories');

      if (!playersData || !categoriesData) {
        router.push(`/${lang}/setup`);
        return;
      }

      const parsedPlayers: Player[] = JSON.parse(playersData);
      const categoryIds: number[] = JSON.parse(categoriesData);

      const wordData = await getRandomWord(categoryIds, gameLang);

      if (!wordData) {
        router.push(`/${lang}/categories`);
        return;
      }

      setGameWord(wordData.word);

      const randomImpostorIndex = Math.floor(Math.random() * parsedPlayers.length);
      const impostorPlayerId = parsedPlayers[randomImpostorIndex].id;
      setImpostorId(impostorPlayerId);

      const playersWithRoles = parsedPlayers.map((player) => ({
        ...player,
        role: (player.id === impostorPlayerId ? 'impostor' : 'civilian') as PlayerRole,
        word: player.id === impostorPlayerId ? undefined : wordData.word,
      }));

      setPlayers(playersWithRoles);
      setLoading(false);
    };

    initializeGame();
  }, [router, lang]);

  const currentPlayer = players[currentPlayerIndex];
  const isLastPlayer = currentPlayerIndex === players.length - 1;
  const nextPlayer = !isLastPlayer ? players[currentPlayerIndex + 1] : null;

  const handleRevealed = () => {
    setHasRevealed(true);
  };

  const handleNext = () => {
    if (!isLastPlayer) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setHasRevealed(false);
    } else {
      sessionStorage.setItem('gameWord', gameWord || '');
      sessionStorage.setItem('impostorId', impostorId || '');
      sessionStorage.setItem('gamePlayers', JSON.stringify(players));
      router.push(`/${lang}/play`);
    }
  };

  if (loading || !currentPlayer || !dict) {
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

      <main className="flex-1 flex flex-col w-full max-w-md">
        {/* Player indicator */}
        <div className="text-center mb-6">
          <p className="text-gray-muted text-sm mb-1">
            {dict.reveal.playerOf
              .replace('{current}', String(currentPlayerIndex + 1))
              .replace('{total}', String(players.length))}
          </p>
          <h1 className="text-3xl font-bold text-white">{currentPlayer.name}</h1>
        </div>

        {/* Reveal card with role behind */}
        <div className="flex-1 flex flex-col justify-center mb-6">
          <RevealCard
            onRevealed={handleRevealed}
            hasRevealed={hasRevealed}
            slideText={dict.reveal.slideToReveal}
            holdText={dict.reveal.holdToSee}
            revealAgainText={dict.reveal.slideToRevealAgain}
          >
            <RoleDisplay
              isImpostor={currentPlayer.role === 'impostor'}
              word={currentPlayer.word}
              impostorText={dict.reveal.youAreImpostor}
              civilianText={dict.reveal.youAreCivilian}
              wordLabel={dict.reveal.yourWord}
            />
          </RevealCard>
        </div>

        {/* Next player info & button */}
        <AnimatePresence>
          {hasRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-4"
            >
              {/* Pass device message */}
              {nextPlayer && (
                <Card variant="glass" className="p-4 text-center">
                  <p className="text-gray-muted text-sm mb-1">{dict.reveal.passDevice}</p>
                  <div className="flex items-center justify-center gap-2">
                    <UserIcon size={20} className="text-purple-light" />
                    <span className="text-white font-semibold text-lg">{nextPlayer.name}</span>
                  </div>
                </Card>
              )}

              {/* All ready message */}
              {isLastPlayer && (
                <Card variant="glass" className="p-4 text-center">
                  <p className="text-emerald-400 font-semibold">{dict.reveal.allReady}</p>
                </Card>
              )}

              {/* Next/Start button */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleNext}
                className="flex items-center justify-center gap-2"
              >
                {isLastPlayer ? dict.reveal.startGame : dict.reveal.nextPlayer}
                <ArrowRightIcon size={20} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress dots */}
        <div className="mt-8">
          <PlayerProgress current={currentPlayerIndex} total={players.length} />
        </div>
      </main>

      <footer className="h-8" />
    </motion.div>
  );
}
