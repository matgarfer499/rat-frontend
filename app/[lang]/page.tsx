'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCurrentUser, logout, type User } from '@/lib/auth';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useDictionary } from '@/hooks/useDictionary';

export default function Lobby() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const dict = useDictionary();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  if (!dict) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-2xl relative">
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">{dict.lobby.title}</h1>
          <p className="mt-2 text-gray-600">{dict.lobby.subtitle}</p>
          
          {!loading && (
            <div className="mt-4">
              {user ? (
                <div className="flex items-center justify-center gap-3">
                  <span className="text-sm text-gray-700">
                    👤 {user.username}
                    {user.role === 'admin' && ' 👑'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    {dict.common.logout}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Link
                    href={`/${lang}/login`}
                    className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    {dict.auth.login}
                  </Link>
                  <span className="text-gray-400">|</span>
                  <Link
                    href={`/${lang}/register`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    {dict.auth.register}
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.push(`/${lang}/setup`)}
            className="w-full rounded-lg bg-purple-600 px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-purple-700 hover:shadow-lg active:scale-95"
          >
            🎮 {dict.lobby.startGame}
          </button>

          <button
            disabled
            className="w-full cursor-not-allowed rounded-lg bg-gray-300 px-6 py-4 text-lg font-semibold text-gray-500"
          >
            🌐 Multiplayer (Coming Soon)
          </button>
        </div>

        <div className="rounded-lg bg-blue-50 p-4">
          <h2 className="mb-2 font-semibold text-blue-900">How to Play:</h2>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• All civilians get the same word</li>
            <li>• The impostor doesn't know the word</li>
            <li>• Take turns saying synonyms</li>
            <li>• Find the impostor before they blend in!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
