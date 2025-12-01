'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@components/button';
import { useDictionary } from '@hooks/use-dictionary';
import { createRoom } from '@lib/rooms-api';
import type { CreateRoomRequest } from '@lib/rooms-api';

interface Category {
  id: number;
  key: string;
  translations: Array<{
    language: string;
    name: string;
  }>;
}

export default function CreateRoomPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const dict = useDictionary();
  
  const [username, setUsername] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    // Get username from localStorage
    const storedUsername = localStorage.getItem('temp_username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      router.push(`/${lang}/multiplayer`);
      return;
    }

    // Fetch categories
    const fetchCategories = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/categories/?language=${lang}`);
        const data = await response.json();
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategory(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [lang, router]);

  const handleCreateRoom = async () => {
    if (!selectedCategory) {
      alert(dict?.multiplayer?.selectCategory || 'Please select a category');
      return;
    }

    setLoading(true);
    try {
      const request: CreateRoomRequest = {
        username,
        category_id: selectedCategory,
        max_players: maxPlayers,
        is_public: isPublic,
        password: password || undefined,
      };

      const room = await createRoom(request);
      
      // Store room info and redirect to room page
      localStorage.setItem('current_room_id', room.id);
      router.push(`/${lang}/multiplayer/room/${room.id}`);
      
    } catch (error: any) {
      alert(error.message || dict?.multiplayer?.error || 'Error creating room');
    } finally {
      setLoading(false);
    }
  };

  if (!dict) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="text-white text-xl">{dict?.common?.loading || 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            ➕ {dict.multiplayer?.createRoom || 'Create Room'}
          </h1>
          <p className="mt-2 text-sm text-gray-900">
            👤 {username}
          </p>
        </div>

        <div className="space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {dict.multiplayer?.selectCategory || 'Select category'}
            </label>
            {loadingCategories ? (
              <div className="text-center py-4 text-gray-500">
                {dict.multiplayer?.loading || 'Loading...'}
              </div>
            ) : (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.map((category) => {
                  const translation = category.translations?.find(t => t.language === lang);
                  const categoryName = translation?.name || category.key;
                  return (
                    <option key={category.id} value={category.id}>
                      {categoryName}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Max Players */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {dict.multiplayer?.maxPlayers || 'Max players'}: {maxPlayers}
            </label>
            <input
              type="range"
              min="3"
              max="12"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>3</span>
              <span>12</span>
            </div>
          </div>

          {/* Visibility Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {dict.multiplayer?.roomVisibility || 'Visibility'}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setIsPublic(true)}
                className={`flex-1 rounded-lg px-4 py-3 font-medium transition-colors ${
                  isPublic
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🌐 {dict.multiplayer?.publicRoom || 'Public'}
              </button>
              <button
                onClick={() => setIsPublic(false)}
                className={`flex-1 rounded-lg px-4 py-3 font-medium transition-colors ${
                  !isPublic
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔒 {dict.multiplayer?.privateRoom || 'Private'}
              </button>
            </div>
          </div>

          {/* Password (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {dict.multiplayer?.password || 'Password'} ({dict.multiplayer?.optional || 'Optional'})
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={20}
            />
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={handleCreateRoom}
              disabled={loading || loadingCategories}
              size="lg"
              fullWidth
            >
              {loading ? (dict.multiplayer?.creating || 'Creating...') : (dict.multiplayer?.create || 'Create')}
            </Button>

            <Button
              onClick={() => router.push(`/${lang}/multiplayer`)}
              variant="ghost"
              size="lg"
              fullWidth
            >
              ← {dict.common?.back || 'Back'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
