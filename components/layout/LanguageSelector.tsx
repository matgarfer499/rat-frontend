'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { i18n, type Locale } from '@i18n/config';
import { useTransition } from 'react';

export function LanguageSelector() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentLang = (params?.lang as Locale) || i18n.defaultLocale;
  const [isPending, startTransition] = useTransition();

  const changeLanguage = (newLang: Locale) => {
    if (newLang === currentLang || isPending) return;
    
    const segments = pathname.split('/');
    segments[1] = newLang;
    const newPath = segments.join('/');

    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;
    
    // Use View Transitions API if available
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        startTransition(() => {
          router.push(newPath);
        });
      });
    } else {
      // Fallback: simple transition
      startTransition(() => {
        router.push(newPath);
      });
    }
  };

  return (
    <div 
      className="flex items-center bg-surface-dark/50 backdrop-blur-sm rounded-full border border-white/10 p-1"
      role="group"
      aria-label="Language selector"
    >
      {/* ES Button */}
      <button
        onClick={() => changeLanguage('es')}
        disabled={isPending}
        className={`
          px-3 py-1 rounded-full text-xs font-bold transition-colors
          ${currentLang === 'es' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white'}
          ${isPending ? 'opacity-50 cursor-wait' : ''}
        `}
        aria-pressed={currentLang === 'es'}
      >
        ES
      </button>

      {/* EN Button */}
      <button
        onClick={() => changeLanguage('en')}
        disabled={isPending}
        className={`
          px-3 py-1 rounded-full text-xs font-medium transition-colors
          ${currentLang === 'en' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white'}
          ${isPending ? 'opacity-50 cursor-wait' : ''}
        `}
        aria-pressed={currentLang === 'en'}
      >
        EN
      </button>
    </div>
  );
}
