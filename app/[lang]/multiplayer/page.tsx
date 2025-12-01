'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@components/button';
import { useDictionary } from '@hooks/use-dictionary';

export default function MultiplayerLobby() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const dict = useDictionary();
  
  const [username, setUsername] = useState('');

  const handleCreateRoom = () => {
    if (!username.trim()) {
      alert('Por favor ingresa un nombre de usuario');
      return;
    }
    localStorage.setItem('temp_username', username);
    router.push(`/${lang}/multiplayer/create`);
  };

  const handleJoinRoom = () => {
    if (!username.trim()) {
      alert('Por favor ingresa un nombre de usuario');
      return;
    }
    localStorage.setItem('temp_username', username);
    router.push(`/${lang}/multiplayer/join`);
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
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            🌐 {dict.multiplayer?.title || 'Multiplayer'}
          </h1>
          <p className="mt-2 text-gray-900">
            {dict.multiplayer?.subtitle || 'Play with friends online!'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              {dict.multiplayer?.username || 'Username'}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={dict.multiplayer?.enterUsername || 'Enter your username'}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={20}
            />
          </div>

          <div className="space-y-3 pt-4">
            <Button
              onClick={handleCreateRoom}
              size="lg"
              fullWidth
            >
              ➕ {dict.multiplayer?.createRoom || 'Create Room'}
            </Button>

            <Button
              onClick={handleJoinRoom}
              variant="secondary"
              size="lg"
              fullWidth
            >
              🚪 {dict.multiplayer?.joinRoom || 'Join Room'}
            </Button>

            <Button
              onClick={() => router.push(`/${lang}`)}
              variant="ghost"
              size="lg"
              fullWidth
            >
              ← {dict.common.back}
            </Button>
          </div>

          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            💡 {dict.multiplayer?.playAsGuest || 'Play as guest - No account required!'}
          </div>
        </div>
      </div>
    </div>
  );
}
