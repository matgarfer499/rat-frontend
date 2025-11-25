'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Player } from '@lib/types';
import { useDictionary } from '@hooks/use-dictionary';
import { LanguageSelector } from '@components/language-selector';

const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export default function SetupPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const dict = useDictionary();
  const [language, setLanguage] = useState('en');
  const [playerCount, setPlayerCount] = useState(3);
  const [playerNames, setPlayerNames] = useState<string[]>(Array(3).fill(''));

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    const newNames = Array(count).fill('');
    playerNames.forEach((name, i) => {
      if (i < count) newNames[i] = name;
    });
    setPlayerNames(newNames);
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleContinue = () => {
    const allNamesFilled = playerNames.every(name => name.trim() !== '');
    
    if (!allNamesFilled) {
      alert('Please fill in all player names');
      return;
    }

    const players: Player[] = playerNames.map((name, index) => ({
      id: `player-${index}`,
      name: name.trim(),
      hasSeenRole: false,
    }));

    // Store in sessionStorage
    sessionStorage.setItem('gameLanguage', language);
    sessionStorage.setItem('gamePlayers', JSON.stringify(players));

    router.push(`/${lang}/categories`);
  };

  if (!dict) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="w-full max-w-2xl space-y-6 rounded-2xl bg-white p-8 shadow-2xl relative">
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">{dict.setup.title}</h1>
          <p className="mt-2 text-gray-600">Configure your local game</p>
        </div>

        {/* Language Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            {dict.setup.selectLanguage}
          </label>
          <div className="grid grid-cols-3 gap-3 text-stone-700">
            {AVAILABLE_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`rounded-lg border-2 p-4 transition-all ${
                  language === lang.code
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-2xl">{lang.flag}</div>
                <div className="mt-2 text-sm font-medium">{lang.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Player Count */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            {dict.setup.numberOfPlayers} (3-10)
          </label>
          <input
            type="number"
            min="3"
            max="10"
            value={playerCount}
            onChange={(e) => handlePlayerCountChange(parseInt(e.target.value))}
            className="w-full text-stone-700 rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-purple-600 focus:outline-none"
          />
        </div>

        {/* Player Names */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            {dict.setup.playersNames}
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {playerNames.map((name, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Player ${index + 1}`}
                value={name}
                onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                className="rounded-lg text-stone-700 border-2 border-gray-300 px-4 py-2 focus:border-purple-600 focus:outline-none"
              />
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => router.back()}
            className="flex-1 rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50"
          >
            {dict.common.back}
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-all hover:bg-purple-700 active:scale-95"
          >
            {dict.setup.continue}
          </button>
        </div>
      </div>
    </div>
  );
}
