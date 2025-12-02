'use client';

import { useRouter, useParams } from 'next/navigation';
import { LanguageSelector } from '@components/layout/LanguageSelector';
import { GameModeCard } from '@components/ui/GameModeCard';
import { DeviceIcon, UsersIcon, RatIcon } from '@components/icons';
import { useDictionary } from '@hooks/use-dictionary';

export default function Home() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const dict = useDictionary();

  if (!dict) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-purple-light text-xl animate-pulse">
          {/* Loading state without text to avoid flash */}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-6 sm:py-8">
      {/* Header with language selector */}
      <header className="w-full max-w-md flex justify-end mb-8">
        <LanguageSelector />
      </header>

      {/* Title section */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
        {/* Rat logo/icon */}
        <div className="mb-4">
          <div className="w-20 h-20 rounded-full bg-purple-base/20 border-2 border-purple-base/40 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <RatIcon size={48} className="text-purple-light" />
          </div>
        </div>

        {/* R.A.T. Title */}
        <h1 className="text-5xl sm:text-6xl font-black text-white tracking-wider text-glow-purple mb-2">
          R<span className="text-purple-light">.</span>A<span className="text-purple-light">.</span>T<span className="text-purple-light">.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-muted text-lg sm:text-xl font-medium tracking-wide mb-2">
          {dict.lobby.subtitle}
        </p>

        {/* Tagline */}
        <p className="text-cyan-accent text-sm sm:text-base mb-12 text-glow-cyan">
          {dict.lobby.tagline}
        </p>

        {/* Game mode cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <GameModeCard
            title={dict.lobby.localGame}
            description={dict.lobby.localGameDesc}
            icon={<DeviceIcon size={32} />}
            onClick={() => router.push(`/${lang}/setup`)}
            accentColor="purple"
          />

          <GameModeCard
            title={dict.lobby.multiplayerGame}
            description={dict.lobby.multiplayerGameDesc}
            icon={<UsersIcon size={32} />}
            onClick={() => router.push(`/${lang}/multiplayer`)}
            accentColor="cyan"
          />
        </div>
      </main>

      {/* Footer spacer */}
      <footer className="h-8 sm:h-12" />
    </div>
  );
}
