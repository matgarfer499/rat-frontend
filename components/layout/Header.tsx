'use client';

import { LanguageSelector } from './LanguageSelector';

export function Header() {
  return (
    <header className="flex justify-center items-center px-6 py-6 z-20">
      <LanguageSelector />
    </header>
  );
}
