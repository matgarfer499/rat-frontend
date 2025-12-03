'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@components/button';
import { Card } from '@components/ui';
import { LanguageSelector } from '@components/layout/LanguageSelector';
import { useDictionary } from '@hooks/use-dictionary';
import { createRoom } from '@lib/rooms-api';
import type { CreateRoomRequest } from '@lib/rooms-api';
import { 
  ArrowLeftIcon, 
  CreateRoomIcon, 
  UsersIcon, 
  LockIcon, 
  UnlockIcon,
  MinusIcon,
  PlusIcon 
} from '@components/icons';

export default function CreateRoomPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const dict = useDictionary();
  
  const [username, setUsername] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('temp_username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      router.push(`/${lang}/multiplayer`);
    }
  }, [lang, router]);

  const handleCreateRoom = async () => {
    // Validate: private rooms must have password
    if (!isPublic && !password.trim()) {
      setError(dict?.multiplayer?.passwordRequiredForPrivate || 'Private rooms require a password');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const request: CreateRoomRequest = {
        username,
        category_id: 1, // Default category for now
        max_players: maxPlayers,
        is_public: isPublic,
        password: !isPublic ? password : undefined,
      };

      const room = await createRoom(request);
      
      localStorage.setItem('current_room_id', room.id);
      router.push(`/${lang}/multiplayer/room/${room.id}`);
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : dict?.multiplayer?.error || 'Error creating room';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const adjustPlayers = (delta: number) => {
    setMaxPlayers(prev => Math.min(12, Math.max(3, prev + delta)));
  };

  if (!dict) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-purple-light text-xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex min-h-screen flex-col items-center px-4 py-6 sm:py-8"
    >
      {/* Header */}
      <header className="w-full max-w-md flex justify-between items-center mb-8">
        <button
          onClick={() => router.push(`/${lang}/multiplayer`)}
          className="p-2 rounded-lg text-gray-muted hover:text-white hover:bg-purple-base/20 transition-colors"
        >
          <ArrowLeftIcon size={24} />
        </button>
        <LanguageSelector />
      </header>

      <main className="flex-1 flex flex-col w-full max-w-md">
        {/* Title section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl 
                       bg-gradient-to-br from-cyan-accent/20 to-purple-base/20 
                       border border-cyan-accent/30 mb-4"
          >
            <CreateRoomIcon size={40} className="text-cyan-accent" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white mb-2"
          >
            {dict.multiplayer?.createRoom || 'Create Room'}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-muted"
          >
            {dict.multiplayer?.creatingAs || 'Creating as'} <span className="text-cyan-accent font-medium">{username}</span>
          </motion.p>
        </div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {/* Max Players */}
          <Card variant="glass" className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-base/20 border border-purple-base/30 
                                flex items-center justify-center">
                  <UsersIcon size={20} className="text-purple-light" />
                </div>
                <div>
                  <p className="text-white font-medium">{dict.multiplayer?.maxPlayers || 'Max players'}</p>
                  <p className="text-gray-muted text-sm">{dict.multiplayer?.playersRange || '3-12 players'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustPlayers(-1)}
                  disabled={maxPlayers <= 3}
                  className="w-10 h-10 rounded-lg bg-purple-darker border border-purple-base/30 
                             flex items-center justify-center text-gray-muted
                             hover:bg-purple-base/20 hover:text-white transition-colors
                             disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <MinusIcon size={18} />
                </button>
                <span className="w-10 text-center text-2xl font-bold text-white">{maxPlayers}</span>
                <button
                  onClick={() => adjustPlayers(1)}
                  disabled={maxPlayers >= 12}
                  className="w-10 h-10 rounded-lg bg-purple-darker border border-purple-base/30 
                             flex items-center justify-center text-gray-muted
                             hover:bg-purple-base/20 hover:text-white transition-colors
                             disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <PlusIcon size={18} />
                </button>
              </div>
            </div>
          </Card>

          {/* Visibility */}
          <Card variant="glass" className="p-4">
            <p className="text-white font-medium mb-3">{dict.multiplayer?.roomVisibility || 'Visibility'}</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setIsPublic(true);
                  setPassword('');
                  setError('');
                }}
                className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                  isPublic
                    ? 'bg-cyan-accent/10 border-cyan-accent/50 text-cyan-accent'
                    : 'bg-purple-darker/50 border-purple-base/30 text-gray-muted hover:border-purple-base/50'
                }`}
              >
                <UnlockIcon size={24} />
                <span className="font-medium">{dict.multiplayer?.publicRoom || 'Public'}</span>
              </button>
              <button
                onClick={() => setIsPublic(false)}
                className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                  !isPublic
                    ? 'bg-yellow-glow/10 border-yellow-glow/50 text-yellow-glow'
                    : 'bg-purple-darker/50 border-purple-base/30 text-gray-muted hover:border-purple-base/50'
                }`}
              >
                <LockIcon size={24} />
                <span className="font-medium">{dict.multiplayer?.privateRoom || 'Private'}</span>
              </button>
            </div>
            <p className="text-gray-muted text-sm mt-3 text-center">
              {isPublic 
                ? (dict.multiplayer?.publicRoomDescription || 'Anyone can find and join')
                : (dict.multiplayer?.privateRoomDescription || 'Password required to join')
              }
            </p>
          </Card>

          {/* Password (only for private) */}
          {!isPublic && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card variant="glass" className="p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-muted mb-3">
                  <LockIcon size={16} />
                  {dict.multiplayer?.password || 'Password'} <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder={dict.multiplayer?.enterPassword || 'Enter password'}
                  className="w-full bg-purple-darker/50 border border-purple-base/30 rounded-xl 
                             px-4 py-3 text-white placeholder-gray-muted/50
                             focus:border-yellow-glow/50 focus:outline-none focus:ring-2 focus:ring-yellow-glow/20
                             transition-all"
                  maxLength={20}
                />
                <p className="text-gray-muted text-xs mt-2">
                  {dict.multiplayer?.passwordHint || 'Share this password with players you want to invite'}
                </p>
              </Card>
            </motion.div>
          )}

          {/* Error message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center"
            >
              {error}
            </motion.p>
          )}
        </motion.div>

        {/* Create button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Button
            onClick={handleCreateRoom}
            disabled={loading}
            variant="primary"
            size="lg"
            fullWidth
            className="flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>{dict.multiplayer?.creating || 'Creating...'}</span>
            ) : (
              <>
                <CreateRoomIcon size={20} />
                {dict.multiplayer?.create || 'Create Room'}
              </>
            )}
          </Button>
        </motion.div>
      </main>

      <footer className="h-8" />
    </motion.div>
  );
}
