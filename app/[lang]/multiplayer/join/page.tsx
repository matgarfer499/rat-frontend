'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@components/button';
import { useDictionary } from '@hooks/use-dictionary';
import { getPublicRooms, joinRoom, checkRoom } from '@lib/rooms-api';
import type { PublicRoom, JoinRoomRequest, CheckRoomResponse } from '@lib/rooms-api';

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
  const searchParams = useSearchParams();
  const lang = params.lang as string;
  const dict = useDictionary();
  
  // URL query params
  const codeFromUrl = searchParams.get('code');
  
  const [username, setUsername] = useState('');
  const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [roomCode, setRoomCode] = useState(codeFromUrl || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);
  
  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState<string>('');
  const [pendingRoomInfo, setPendingRoomInfo] = useState<CheckRoomResponse | null>(null);
  const [passwordError, setPasswordError] = useState('');

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

  const handleCheckRoom = async (roomId: string, currentUsername?: string) => {
    const usernameToUse = currentUsername || username;
    
    if (!usernameToUse.trim()) {
      setPendingRoomId(roomId);
      setShowUsernameModal(true);
      return;
    }

    setLoading(true);
    try {
      const roomInfo = await checkRoom(roomId);
      
      if (roomInfo.phase !== 'waiting') {
        alert(dict?.multiplayer?.gameStarted || 'Game has already started');
        setLoading(false);
        return;
      }
      
      if (roomInfo.player_count >= roomInfo.max_players) {
        alert(dict?.multiplayer?.roomFull || 'Room is full');
        setLoading(false);
        return;
      }

      if (roomInfo.requires_password) {
        // Private room - show password modal
        setPendingRoomId(roomId);
        setPendingRoomInfo(roomInfo);
        setShowPasswordModal(true);
        setLoading(false);
      } else {
        // Public room - join directly
        await handleJoinRoom(roomId, usernameToUse);
      }
    } catch (error: any) {
      alert(error.message || dict?.multiplayer?.roomNotFound || 'Room not found');
      setLoading(false);
    }
  };

  const handleJoinRoom = async (roomId: string, currentUsername?: string, roomPassword?: string) => {
    const usernameToUse = currentUsername || username;
    const passwordToUse = roomPassword || password;

    setLoading(true);
    setPasswordError('');
    
    try {
      const request: JoinRoomRequest = {
        username: usernameToUse,
        room_id: roomId,
        password: passwordToUse || undefined,
      };

      const response = await joinRoom(request);
      
      // Store room info and redirect to room page
      localStorage.setItem('current_room_id', response.room_id);
      localStorage.setItem('player_id', response.player_id);
      localStorage.setItem('temp_username', usernameToUse);
      // Store password for Socket.IO connection (only for private rooms)
      if (passwordToUse) {
        localStorage.setItem('room_password', passwordToUse);
      } else {
        localStorage.removeItem('room_password');
      }
      
      // Close modals
      setShowPasswordModal(false);
      setShowUsernameModal(false);
      
      router.push(`/${lang}/multiplayer/room/${response.room_id}`);
      
    } catch (error: any) {
      const errorMessage = error.message || dict?.multiplayer?.error || 'Error joining room';
      
      if (errorMessage.toLowerCase().includes('password')) {
        setPasswordError(dict?.multiplayer?.invalidPassword || 'Invalid password');
      } else {
        alert(errorMessage);
      }
      setLoading(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!roomCode.trim()) {
      alert(dict?.multiplayer?.enterRoomCode || 'Please enter a room code');
      return;
    }

    await handleCheckRoom(roomCode.trim());
  };

  const handleUsernameSubmit = () => {
    if (!username.trim()) {
      return;
    }
    
    localStorage.setItem('temp_username', username);
    setShowUsernameModal(false);
    
    if (pendingRoomId) {
      handleCheckRoom(pendingRoomId, username);
    }
    
    // Load rooms for browsing
    loadPublicRooms();
    loadCategories();
  };

  const handlePasswordSubmit = () => {
    if (!password.trim()) {
      setPasswordError(dict?.multiplayer?.enterPassword || 'Please enter the password');
      return;
    }
    
    handleJoinRoom(pendingRoomId, username, password);
  };

  // Check if we came from the lobby with a username
  useEffect(() => {
    const storedUsername = localStorage.getItem('temp_username');
    
    if (codeFromUrl) {
      // Came from a link - check if we have username
      if (storedUsername) {
        setUsername(storedUsername);
        // Auto-check the room from URL
        handleCheckRoom(codeFromUrl, storedUsername);
      } else {
        // Need to ask for username first
        setPendingRoomId(codeFromUrl);
        setShowUsernameModal(true);
      }
    } else if (storedUsername) {
      // Normal flow from lobby
      setUsername(storedUsername);
      loadPublicRooms();
      loadCategories();
    } else {
      // No username, redirect to lobby
      router.push(`/${lang}/multiplayer`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return `${dict?.multiplayer?.category || 'Category'} ${categoryId}`;
    const translation = category.translations?.find(t => t.language === lang);
    return translation?.name || category.key;
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
          {username && (
            <p className="mt-2 text-sm text-gray-900">
              👤 {username}
            </p>
          )}
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
                    onClick={() => handleCheckRoom(room.id)}
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

      {/* Username Modal - For link access without username */}
      {showUsernameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-xl font-bold text-gray-900">
              👤 {dict.multiplayer?.enterUsername || 'Enter your username'}
            </h3>
            <p className="text-sm text-gray-600">
              {dict.multiplayer?.usernameRequired || 'You need a username to join the game'}
            </p>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={dict.multiplayer?.username || 'Username'}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
              maxLength={20}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUsernameSubmit();
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleUsernameSubmit}
                disabled={!username.trim()}
                fullWidth
              >
                {dict.common?.continue || 'Continue'}
              </Button>
              <Button
                onClick={() => {
                  setShowUsernameModal(false);
                  router.push(`/${lang}/multiplayer`);
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

      {/* Password Modal - For private rooms */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-xl font-bold text-gray-900">
              🔒 {dict.multiplayer?.passwordRequired || 'Password required'}
            </h3>
            {pendingRoomInfo && (
              <p className="text-sm text-gray-600">
                {dict.multiplayer?.privateRoomMessage || 'This is a private room. Enter the password to join.'}
              </p>
            )}
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              placeholder={dict.multiplayer?.enterPassword || 'Enter password'}
              className={`w-full rounded-lg border px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                passwordError 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
              }`}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handlePasswordSubmit();
                }
              }}
            />
            {passwordError && (
              <p className="text-sm text-red-600">
                ❌ {passwordError}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                onClick={handlePasswordSubmit}
                disabled={loading}
                fullWidth
              >
                {loading ? (dict.multiplayer?.joining || 'Joining...') : (dict.multiplayer?.join || 'Join')}
              </Button>
              <Button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setPasswordError('');
                  setPendingRoomId('');
                  setPendingRoomInfo(null);
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
