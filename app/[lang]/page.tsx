'use client';

import { useRouter, useParams } from 'next/navigation';
import { Header } from '@components/layout/Header';
import { ActionButton } from '@components/ui/ActionButton';
import { GlobeIcon, RatIcon, SmartphoneIcon } from '@components/icons';
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
    <div className="relative flex h-screen w-full flex-col overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" 
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
        }} 
      />
      <div className="fixed bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background-dark via-background-dark/90 to-transparent z-0 pointer-events-none" />

      {/* Header */}
      <Header />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 -mt-10">
        {/* Rat logo with glow effect */}
        <div className="relative w-full max-w-[320px] aspect-square mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full" />
          <div className="relative w-64 h-64 flex items-center justify-center scale-110">
            <RatIcon size={550} className="scale-110" />
          </div>
        </div>

        {/* Title section */}
        <div className="flex flex-col items-center gap-2 mb-8 px-6 text-center">
          <h1 className="text-white text-5xl md:text-6xl font-black tracking-tight leading-none drop-shadow-lg italic">
            {dict.lobby.title}
          </h1>
          <p className="text-white/90 text-lg font-bold tracking-widest uppercase">
            {dict.lobby.subtitle}
          </p>
          <p className="text-slate-500 text-xs md:text-sm font-medium mt-2 opacity-60">
            {dict.lobby.tagline.toUpperCase()}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-4 w-full max-w-[320px] px-6">
          <ActionButton
            onClick={() => router.push(`/${lang}/multiplayer`)}
            variant="primary"
            icon={<GlobeIcon size={20} />}
          >
            {dict.lobby.multiplayerGame}
          </ActionButton>

          <ActionButton
            onClick={() => router.push(`/${lang}/setup`)}
            variant="secondary"
            icon={<SmartphoneIcon size={20} />}
          >
            {dict.lobby.localGame}
          </ActionButton>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center z-10">
        <p className="text-slate-600 text-xs font-medium">v1.0.0 • Matías José García Fernández</p>
      </div>
    </div>
  );
}
