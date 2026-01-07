'use client';

import { useParams } from 'next/navigation';
import { Header } from '@components/layout/Header';
import {
  LoadingState,
  BackgroundEffects,
  HeroLogo,
  TitleSection,
  GameActions,
  Footer,
} from '@components/home';
import { useDictionary } from '@hooks/use-dictionary';

export default function Home() {
  const params = useParams();
  const lang = params.lang as string;
  const dict = useDictionary();

  if (!dict) {
    return <LoadingState />;
  }

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden">
      <BackgroundEffects />
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 -mt-10">
        <HeroLogo />
        <TitleSection />
        <GameActions lang={lang} />
      </main>

      <Footer />
    </div>
  );
}
