'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Player, PlayerRole } from '@/lib/types';
import { getRandomWord } from '@/lib/api';
import { useDictionary } from '@/hooks/useDictionary';
import { LanguageSelector } from '@/components/LanguageSelector';

export default function RevealPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const dict = useDictionary();
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showRole, setShowRole] = useState(false);
  const [gameWord, setGameWord] = useState<string | null>(null);
  const [impostorId, setImpostorId] = useState<string | null>(null);
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeGame = async () => {
      // Get data from sessionStorage
      const lang = sessionStorage.getItem('gameLanguage') || 'en';
      const playersData = sessionStorage.getItem('gamePlayers');
      const categoriesData = sessionStorage.getItem('selectedCategories');

      if (!playersData || !categoriesData) {
        router.push('/setup');
        return;
      }

      const parsedPlayers: Player[] = JSON.parse(playersData);
      const categoryIds: number[] = JSON.parse(categoriesData);

      setLanguage(lang);

      // Get random word from selected categories
      const wordData = await getRandomWord(categoryIds, lang);

      if (!wordData) {
        alert('Failed to get a word. Please try again.');
        router.push('/categories');
        return;
      }

      setGameWord(wordData.word);

      // Randomly select impostor (at least 1)
      const randomImpostorIndex = Math.floor(Math.random() * parsedPlayers.length);
      const impostorPlayerId = parsedPlayers[randomImpostorIndex].id;
      setImpostorId(impostorPlayerId);

      // Assign roles
      const playersWithRoles = parsedPlayers.map((player) => ({
        ...player,
        role: (player.id === impostorPlayerId ? 'impostor' : 'civilian') as PlayerRole,
        word: player.id === impostorPlayerId ? undefined : wordData.word,
      }));

      setPlayers(playersWithRoles);
      setLoading(false);
    };

    initializeGame();
  }, [router]);

  const currentPlayer = players[currentPlayerIndex];

  const handleRevealRole = () => {
    setShowRole(true);
  };

  const handleNext = () => {
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setShowRole(false);
    } else {
      // All players have seen their roles, start game
      sessionStorage.setItem('gameWord', gameWord || '');
      sessionStorage.setItem('impostorId', impostorId || '');
      sessionStorage.setItem('gamePlayers', JSON.stringify(players));
      router.push(`/${lang}/play`);
    }
  };

  if (loading || !currentPlayer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="text-center text-white">
          <div className="mb-4 text-4xl">🎲</div>
          <div className="text-xl font-semibold">{dict?.common.loading || 'Loading...'}</div>
        </div>
      </div>
    );
  }

  if (!dict) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-2xl relative">
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>
        <div className="text-center">
          <div className="mb-2 text-sm font-medium text-gray-500">
            Player {currentPlayerIndex + 1} of {players.length}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{currentPlayer.name}</h1>
        </div>

        {!showRole ? (
          <div className="space-y-6">
            <div className="rounded-lg bg-yellow-50 p-6 text-center">
              <p className="text-yellow-800">
                ⚠️ {dict.reveal.instructions.replace('{name}', currentPlayer.name)}
              </p>
            </div>

            <button
              onClick={handleRevealRole}
              className="w-full rounded-lg bg-purple-600 px-6 py-4 text-xl font-semibold text-white transition-all hover:bg-purple-700 active:scale-95"
            >
              👁️ {dict.reveal.tapToReveal}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div
              className={`rounded-lg p-8 text-center ${
                currentPlayer.role === 'impostor'
                  ? 'bg-red-100'
                  : 'bg-green-100'
              }`}
            >
              <div className="mb-4 text-6xl">
                {currentPlayer.role === 'impostor' ? '🎭' : '👤'}
              </div>
              <h2
                className={`mb-2 text-2xl font-bold ${
                  currentPlayer.role === 'impostor'
                    ? 'text-red-800'
                    : 'text-green-800'
                }`}
              >
                {currentPlayer.role === 'impostor' ? dict.reveal.youAreImpostor : dict.reveal.yourWord}
              </h2>
              
              {currentPlayer.role === 'civilian' && currentPlayer.word && (
                <div className="mt-6">
                  <p className="mb-2 text-sm text-green-700">{dict.reveal.yourWord}</p>
                  <div className="rounded-lg bg-white p-4">
                    <p className="text-3xl font-bold text-green-900">
                      {currentPlayer.word}
                    </p>
                  </div>
                </div>
              )}

              {currentPlayer.role === 'impostor' && (
                <p className="mt-4 text-sm text-red-700">
                  {dict.reveal.impostor}
                </p>
              )}
            </div>

            <button
              onClick={handleNext}
              className="w-full rounded-lg bg-purple-600 px-6 py-4 text-xl font-semibold text-white transition-all hover:bg-purple-700 active:scale-95"
            >
              {currentPlayerIndex < players.length - 1
                ? `➡️ ${dict.common.next}`
                : `🎮 ${dict.reveal.continue}`}
            </button>
          </div>
        )}

        <div className="flex justify-center gap-2">
          {players.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === currentPlayerIndex
                  ? 'bg-purple-600'
                  : index < currentPlayerIndex
                  ? 'bg-purple-300'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
