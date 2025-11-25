'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCurrentUser, logout, type User } from '@/lib/auth';

export default function Lobby() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">RAT Game</h1>
          <p className="mt-2 text-gray-600">Find the impostor among you!</p>
          
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
                    Salir
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Link
                    href="/login"
                    className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    Iniciar sesión
                  </Link>
                  <span className="text-gray-400">|</span>
                  <Link
                    href="/register"
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.push('/setup')}
            className="w-full rounded-lg bg-purple-600 px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-purple-700 hover:shadow-lg active:scale-95"
          >
            🎮 Create Local Game
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
