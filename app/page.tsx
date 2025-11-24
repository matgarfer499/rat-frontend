'use client';

import { useRouter } from 'next/navigation';

export default function Lobby() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">RAT Game</h1>
          <p className="mt-2 text-gray-600">Find the impostor among you!</p>
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
