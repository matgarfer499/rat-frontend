'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@components/button';
import { useDictionary } from '@hooks/use-dictionary';
import { getPublicRooms, joinRoom } from '@lib/rooms-api';
import type { PublicRoom, JoinRoomRequest } from '@lib/rooms-api';

interface Category {
  id: number;
  key: string;
  translations: Array<{
    language: string;
    name: string;
  }>;
}

export default function JoinRoomPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const dict = useDictionary();
  
  const [username, setUsername] = useState('');
  const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [roomCode, setRoomCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  useEffect(() => {
    // Get username from localStorage
    const storedUsername = localStorage.getItem('temp_username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      router.push(`/${lang}/multiplayer`);
      return;
    }

    loadPublicRooms();
    loadCategories();
  }, [lang, router]);

  const loadCategories = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/categories/?language=${lang}`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const loadPublicRooms = async () => {
    setLoadingRooms(true);
    try {
      const rooms = await getPublicRooms();
      setPublicRooms(rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoadingRooms(false);
    }
  };

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return `${dict?.multiplayer?.category || 'Category'} ${categoryId}`;
    const translation = category.translations?.find(t => t.language === lang);
    return translation?.name || category.key;
  };

  const handleJoinRoom = async (roomId: string, requiresPassword: boolean = false) => {
    if (requiresPassword && !password) {
      setSelectedRoomId(roomId);
      setShowPasswordModal(true);
      return;
    }

    setLoading(true);
    try {
      const request: JoinRoomRequest = {
        username,
        room_id: roomId,
        password: password || undefined,
      };

      const response = await joinRoom(request);
      
      // Store room info and redirect to room page
      localStorage.setItem('current_room_id', response.room_id);
      localStorage.setItem('player_id', response.player_id);
      router.push(`/${lang}/multiplayer/room/${response.room_id}`);
      
    } catch (error: any) {
      const errorMessage = error.message || dict?.multiplayer?.error || 'Error joining room';
      alert(errorMessage);
      
      // Reset password modal if shown
      if (showPasswordModal) {
        setPassword('');
        setShowPasswordModal(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!roomCode.trim()) {
      alert(dict?.multiplayer?.enterRoomCode || 'Please enter a room code');
      return;
    }

    await handleJoinRoom(roomCode.trim());
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
      <div className="w-full max-w-2xl space-y-6 rounded-2xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            🚪 {dict.multiplayer?.joinRoom || 'Join Room'}
          </h1>
          <p className="mt-2 text-sm text-gray-900">
            👤 {username}
          </p>
        </div>

        {/* Join by Code */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {dict.multiplayer?.joinByCode || 'Join by code'}
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder={dict.multiplayer?.enterRoomCode || 'Enter room code'}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={16}
            />
            <Button
              onClick={handleJoinByCode}
              disabled={loading}
            >
              {loading ? (dict.multiplayer?.joining || 'Joining...') : (dict.multiplayer?.join || 'Join')}
            </Button>
          </div>
        </div>

        {/* Public Rooms List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {dict.multiplayer?.publicRooms || 'Public Rooms'}
            </h2>
            <button
              onClick={loadPublicRooms}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              🔄 {dict.multiplayer?.refresh || 'Refresh'}
            </button>
          </div>

          {loadingRooms ? (
            <div className="text-center py-8 text-gray-500">
              {dict.multiplayer?.loading || 'Loading...'}
            </div>
          ) : publicRooms.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              {dict.multiplayer?.noPublicRooms || 'No public rooms available'}
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {publicRooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {getCategoryName(room.category_id)}
                    </div>
                    <div className="text-sm text-gray-900">
                      👥 {room.player_count}/{room.max_players} {dict.multiplayer?.players || 'players'}
                    </div>
                    <div className="text-xs text-gray-700 font-mono mt-1">
                      {room.id}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={loading || room.player_count >= room.max_players}
                    size="sm"
                  >
                    {room.player_count >= room.max_players 
                      ? '🔒 ' + (dict.multiplayer?.roomFull || 'Full')
                      : dict.multiplayer?.join || 'Join'
                    }
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <Button
          onClick={() => router.push(`/${lang}/multiplayer`)}
          variant="ghost"
          size="lg"
          fullWidth
        >
          ← {dict.common?.back || 'Back'}
        </Button>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-xl font-bold text-gray-900">
              🔒 {dict.multiplayer?.passwordRequired || 'Password required'}
            </h3>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={dict.multiplayer?.enterPassword || 'Enter password'}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleJoinRoom(selectedRoomId, true);
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleJoinRoom(selectedRoomId, true)}
                disabled={loading}
                fullWidth
              >
                {loading ? (dict.multiplayer?.joining || 'Joining...') : (dict.multiplayer?.join || 'Join')}
              </Button>
              <Button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                }}
                variant="ghost"
                fullWidth
              >
                {dict.common?.cancel || 'Cancel'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
