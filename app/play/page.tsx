'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Player } from '@/lib/types';

export default function PlayPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameWord, setGameWord] = useState<string>('');
  const [impostorId, setImpostorId] = useState<string>('');
  const [showReveal, setShowReveal] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  useEffect(() => {
    const playersData = sessionStorage.getItem('gamePlayers');
    const word = sessionStorage.getItem('gameWord');
    const impostor = sessionStorage.getItem('impostorId');

    if (!playersData || !word || !impostor) {
      router.push('/setup');
      return;
    }

    setPlayers(JSON.parse(playersData));
    setGameWord(word);
    setImpostorId(impostor);
  }, [router]);

  const handleRevealImpostor = () => {
    setShowReveal(true);
  };

  const handlePlayAgain = () => {
    sessionStorage.clear();
    router.push('/');
  };

  const impostorPlayer = players.find((p) => p.id === impostorId);

  if (players.length === 0) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="w-full max-w-2xl space-y-6 rounded-2xl bg-white p-8 shadow-2xl">
        {!showReveal ? (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Game in Progress</h1>
              <p className="mt-2 text-gray-600">
                Take turns saying synonyms of your word
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-6">
              <h2 className="mb-4 text-center text-xl font-bold text-blue-900">
                How to Play:
              </h2>
              <ol className="space-y-2 text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2 font-bold">1.</span>
                  <span>
                    Each player takes turns saying a synonym or description of their word
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-bold">2.</span>
                  <span>
                    The impostor must try to blend in without knowing the word
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-bold">3.</span>
                  <span>
                    After discussion, vote on who you think is the impostor
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-bold">4.</span>
                  <span>
                    Click "Reveal Impostor" to see if you guessed correctly!
                  </span>
                </li>
              </ol>
            </div>

            <div className="rounded-lg border-2 border-purple-200 p-6">
              <h3 className="mb-4 text-center font-semibold text-gray-700">
                Players ({players.length})
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`rounded-lg border-2 p-3 transition-all ${
                      index === currentPlayerIndex
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{player.name}</span>
                      {index === currentPlayerIndex && (
                        <span className="text-sm text-purple-600">● Current</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPlayerIndex(
                      (prev) => (prev - 1 + players.length) % players.length
                    )
                  }
                  className="rounded-lg bg-gray-200 px-4 py-2 font-medium transition-all hover:bg-gray-300"
                >
                  ← Prev
                </button>
                <button
                  onClick={() =>
                    setCurrentPlayerIndex((prev) => (prev + 1) % players.length)
                  }
                  className="rounded-lg bg-gray-200 px-4 py-2 font-medium transition-all hover:bg-gray-300"
                >
                  Next →
                </button>
              </div>
            </div>

            <button
              onClick={handleRevealImpostor}
              className="w-full rounded-lg bg-red-600 px-6 py-4 text-xl font-semibold text-white transition-all hover:bg-red-700 active:scale-95"
            >
              🔍 Reveal Impostor
            </button>
          </>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Game Over!</h1>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-green-100 p-6 text-center">
                <h2 className="mb-2 text-lg font-semibold text-green-800">
                  The word was:
                </h2>
                <div className="text-4xl font-bold text-green-900">{gameWord}</div>
              </div>

              <div className="rounded-lg bg-red-100 p-6 text-center">
                <h2 className="mb-4 text-lg font-semibold text-red-800">
                  The impostor was:
                </h2>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl">🎭</span>
                  <span className="text-3xl font-bold text-red-900">
                    {impostorPlayer?.name}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border-2 border-gray-200 p-6">
                <h3 className="mb-3 text-center font-semibold text-gray-700">
                  All Players
                </h3>
                <div className="space-y-2">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className={`rounded-lg p-3 ${
                        player.id === impostorId
                          ? 'bg-red-50 border-2 border-red-300'
                          : 'bg-green-50 border-2 border-green-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{player.name}</span>
                        <span
                          className={`text-sm font-semibold ${
                            player.id === impostorId
                              ? 'text-red-700'
                              : 'text-green-700'
                          }`}
                        >
                          {player.id === impostorId ? '🎭 Impostor' : '👤 Civilian'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePlayAgain}
                className="flex-1 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-all hover:bg-purple-700 active:scale-95"
              >
                🎮 Play Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
