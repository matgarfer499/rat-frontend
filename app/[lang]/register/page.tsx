'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useDictionary } from '@hooks/use-dictionary';
import { LanguageSelector } from '@components/language-selector';
import { RegisterForm } from '@features/auth/register-form';
import type { Locale } from '@i18n/config';

export default function RegisterPage() {
  const params = useParams();
  const lang = params.lang as Locale;
  const dict = useDictionary();

  if (!dict) return <div className="min-h-screen flex items-center justify-center">{dict?.common?.loading || 'Loading...'}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          {dict.auth.register}
        </h1>

        <RegisterForm lang={lang} dict={dict} />

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {dict.auth.alreadyHaveAccount}{' '}
            <Link href={`/${lang}/login`} className="text-blue-600 hover:text-blue-700 font-semibold">
              {dict.auth.loginHere}
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href={`/${lang}`} className="text-gray-500 hover:text-gray-700 text-sm">
            {dict.common.back}
          </Link>
        </div>
      </div>
    </div>
  );
}

