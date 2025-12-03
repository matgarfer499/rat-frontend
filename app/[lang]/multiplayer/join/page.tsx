'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@components/button';
import { Card } from '@components/ui';
import { LanguageSelector } from '@components/layout/LanguageSelector';
import { useDictionary } from '@hooks/use-dictionary';
import { getPublicRooms, joinRoom, checkRoom, getCategories } from '@lib/rooms-api';
import type { PublicRoom, JoinRoomRequest, CheckRoomResponse } from '@lib/rooms-api';
import {
  ArrowLeftIcon,
  UsersIcon,
  UserIcon,
  LockIcon,
  UnlockIcon,
  RefreshIcon,
  DoorEnterIcon,
  FolderIcon,
  AlertIcon,
} from '@components/icons';

interface Category {
  id: number;
  key: string;
  translations: Array<{
    language: string;
    name: string;
  }>;
}

function JoinRoomContent() {
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
      const cats = await getCategories(lang);
      setCategories(cats);
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-game px-4">
        <div className="w-12 h-12 border-4 border-purple-light border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-screen flex-col items-center bg-gradient-game px-4 py-6"
    >
      {/* Header */}
      <header className="w-full max-w-md flex justify-between items-center mb-6">
        <button
          onClick={() => router.push(`/${lang}/multiplayer`)}
          className="p-2 rounded-lg text-gray-muted hover:text-white hover:bg-purple-base/20 transition-colors"
        >
          <ArrowLeftIcon size={24} />
        </button>
        <LanguageSelector />
      </header>

      <main className="flex-1 flex flex-col w-full max-w-md space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <DoorEnterIcon size={48} className="mx-auto text-cyan-accent mb-2" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white">
            {dict.multiplayer?.joinRoom || 'Join Room'}
          </h1>
          {username && (
            <div className="flex items-center justify-center gap-2 text-gray-muted">
              <UserIcon size={16} />
              <span>{username}</span>
            </div>
          )}
        </div>

        {/* Join by Code */}
        <Card variant="glass" className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <FolderIcon size={20} className="text-cyan-accent" />
            <h2 className="text-white font-medium">
              {dict.multiplayer?.joinByCode || 'Join by code'}
            </h2>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder={dict.multiplayer?.enterRoomCode || 'Enter room code'}
              className="flex-1 bg-purple-darker/50 border border-purple-base/30 rounded-xl 
                         px-4 py-3 text-white font-mono tracking-wider placeholder-gray-muted/50
                         focus:border-cyan-accent/50 focus:outline-none focus:ring-2 focus:ring-cyan-accent/20"
              maxLength={16}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleJoinByCode();
              }}
            />
            <Button
              onClick={handleJoinByCode}
              disabled={loading || !roomCode.trim()}
            >
              {loading ? '...' : <DoorEnterIcon size={20} />}
            </Button>
          </div>
        </Card>

        {/* Public Rooms List */}
        <Card variant="glass" className="p-4 flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UsersIcon size={20} className="text-purple-light" />
              <h2 className="text-white font-medium">
                {dict.multiplayer?.publicRooms || 'Public Rooms'}
              </h2>
            </div>
            <button
              onClick={loadPublicRooms}
              disabled={loadingRooms}
              className="p-2 rounded-lg text-gray-muted hover:text-cyan-accent hover:bg-purple-base/20 
                         transition-colors disabled:opacity-50"
            >
              <RefreshIcon size={18} className={loadingRooms ? 'animate-spin' : ''} />
            </button>
          </div>

          {loadingRooms ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-purple-light border-t-transparent rounded-full animate-spin" />
            </div>
          ) : publicRooms.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon size={40} className="mx-auto text-gray-muted/30 mb-3" />
              <p className="text-gray-muted">
                {dict.multiplayer?.noPublicRooms || 'No public rooms available'}
              </p>
              <button
                onClick={loadPublicRooms}
                className="mt-3 text-sm text-cyan-accent hover:underline"
              >
                {dict.multiplayer?.refresh || 'Refresh'}
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              <AnimatePresence>
                {publicRooms.map((room, index) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all
                      ${room.player_count >= room.max_players
                        ? 'bg-purple-darker/30 border border-gray-muted/20 opacity-60'
                        : 'bg-purple-darker/50 border border-purple-base/30 hover:border-cyan-accent/30'
                      }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium truncate">
                          {getCategoryName(room.category_id)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-sm text-gray-muted">
                          <UsersIcon size={14} />
                          <span>{room.player_count}/{room.max_players}</span>
                        </div>
                        <span className="text-xs font-mono text-gray-muted/60">
                          {room.id}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleCheckRoom(room.id)}
                      disabled={loading || room.player_count >= room.max_players}
                      size="sm"
                      variant={room.player_count >= room.max_players ? 'secondary' : 'primary'}
                    >
                      {room.player_count >= room.max_players ? (
                        <LockIcon size={16} />
                      ) : (
                        dict.multiplayer?.join || 'Join'
                      )}
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </Card>
      </main>

      {/* Username Modal */}
      <AnimatePresence>
        {showUsernameModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card variant="glass" className="p-6 max-w-sm w-full space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-accent/20 flex items-center justify-center">
                    <UserIcon size={24} className="text-cyan-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {dict.multiplayer?.enterUsername || 'Enter your username'}
                    </h3>
                    <p className="text-sm text-gray-muted">
                      {dict.multiplayer?.usernameRequired || 'Required to join'}
                    </p>
                  </div>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={dict.multiplayer?.username || 'Username'}
                  className="w-full bg-purple-darker/50 border border-purple-base/30 rounded-xl 
                             px-4 py-3 text-white placeholder-gray-muted/50
                             focus:border-cyan-accent/50 focus:outline-none focus:ring-2 focus:ring-cyan-accent/20"
                  autoFocus
                  maxLength={20}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleUsernameSubmit();
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
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card variant="glass" className="p-6 max-w-sm w-full space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-yellow-glow/20 flex items-center justify-center">
                    <LockIcon size={24} className="text-yellow-glow" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {dict.multiplayer?.passwordRequired || 'Password required'}
                    </h3>
                    <p className="text-sm text-gray-muted">
                      {dict.multiplayer?.privateRoomMessage || 'This room is private'}
                    </p>
                  </div>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder={dict.multiplayer?.enterPassword || 'Enter password'}
                  className={`w-full bg-purple-darker/50 border rounded-xl 
                             px-4 py-3 text-white placeholder-gray-muted/50
                             focus:outline-none focus:ring-2 ${
                               passwordError
                                 ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                 : 'border-purple-base/30 focus:border-cyan-accent/50 focus:ring-cyan-accent/20'
                             }`}
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handlePasswordSubmit();
                  }}
                />
                {passwordError && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertIcon size={16} />
                    <span>{passwordError}</span>
                  </div>
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
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function JoinRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-game px-4">
          <div className="w-12 h-12 border-4 border-purple-light border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <JoinRoomContent />
    </Suspense>
  );
}
