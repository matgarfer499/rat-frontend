'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { i18n, type Locale } from '@i18n/config';
import { useState, useRef, useEffect } from 'react';
import { GlobeIcon, ChevronDownIcon } from '@components/icons';

const LANGUAGE_LABELS: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
};

export function LanguageSelector() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentLang = (params?.lang as Locale) || i18n.defaultLocale;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (newLang: Locale) => {
    const segments = pathname.split('/');
    segments[1] = newLang;
    const newPath = segments.join('/');

    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;
    router.push(newPath);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 rounded-xl px-3 py-2
          bg-purple-base/20 border border-purple-base/40
          text-white text-sm font-medium
          transition-all duration-200
          hover:bg-purple-base/30 hover:border-purple-light/50
          ${isOpen ? 'shadow-[0_0_15px_rgba(168,85,247,0.4)] border-purple-light/60' : ''}
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <GlobeIcon size={18} className="text-purple-light" />
        <span className="uppercase">{currentLang}</span>
        <ChevronDownIcon
          size={16}
          className={`text-purple-light transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className="
            absolute right-0 z-50 mt-2 w-36
            rounded-xl overflow-hidden
            bg-purple-dark/95 border border-purple-base/40
            shadow-[0_4px_24px_rgba(0,0,0,0.5),0_0_20px_rgba(168,85,247,0.2)]
            backdrop-blur-md
          "
          role="listbox"
        >
          {i18n.locales.map((locale) => (
            <button
              key={locale}
              onClick={() => changeLanguage(locale)}
              role="option"
              aria-selected={locale === currentLang}
              className={`
                w-full px-4 py-3 text-left text-sm
                transition-colors duration-150
                hover:bg-purple-base/30
                ${locale === currentLang
                  ? 'bg-purple-base/20 text-purple-light font-semibold'
                  : 'text-white'
                }
              `}
            >
              {LANGUAGE_LABELS[locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
