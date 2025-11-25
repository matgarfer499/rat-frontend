'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { i18n, type Locale } from '@i18n/config';
import { useState } from 'react';

export function LanguageSelector() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentLang = (params?.lang as Locale) || i18n.defaultLocale;
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (newLang: Locale) => {
    const segments = pathname.split('/');
    segments[1] = newLang;
    const newPath = segments.join('/');
    
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;
    router.push(newPath);
    setIsOpen(false);
  };

  const languageNames = {
    es: '🇪🇸 Español',
    en: '🇬🇧 English',
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-md hover:bg-gray-50 transition-colors"
      >
        <span>🌐</span>
        <span>{currentLang.toUpperCase()}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-40 rounded-lg bg-white shadow-xl border border-gray-200">
            {i18n.locales.map((locale) => (
              <button
                key={locale}
                onClick={() => changeLanguage(locale)}
                className={`w-full px-4 py-3 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-gray-100 ${
                  locale === currentLang
                    ? 'bg-purple-50 text-purple-700 font-semibold'
                    : 'text-gray-700'
                }`}
              >
                {languageNames[locale]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
