'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@components/button';
import { Card } from '@components/ui';
import { LanguageSelector } from '@components/layout/LanguageSelector';
import { useDictionary } from '@hooks/use-dictionary';
import { 
  UsersIcon, 
  UserIcon, 
  ArrowLeftIcon, 
  CreateRoomIcon, 
  DoorEnterIcon 
} from '@components/icons';

export default function MultiplayerLobby() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const dict = useDictionary();
  
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const validateAndNavigate = (destination: 'create' | 'join') => {
    if (!username.trim()) {
      setError(dict?.multiplayer?.usernameRequired || 'Please enter a username');
      return;
    }
    setError('');
    localStorage.setItem('temp_username', username.trim());
    router.push(`/${lang}/multiplayer/${destination}`);
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
          onClick={() => router.push(`/${lang}`)}
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
            <UsersIcon size={40} className="text-cyan-accent" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white mb-2"
          >
            {dict.multiplayer?.title || 'Multiplayer'}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-muted"
          >
            {dict.multiplayer?.subtitle || 'Play with friends online!'}
          </motion.p>
        </div>

        {/* Username input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card variant="glass" className="p-4">
            <label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-gray-muted mb-3">
              <UserIcon size={16} />
              {dict.multiplayer?.username || 'Username'}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError('');
              }}
              placeholder={dict.multiplayer?.enterUsername || 'Enter your username'}
              className="w-full bg-purple-darker/50 border border-purple-base/30 rounded-xl 
                         px-4 py-3 text-white placeholder-gray-muted/50
                         focus:border-cyan-accent/50 focus:outline-none focus:ring-2 focus:ring-cyan-accent/20
                         transition-all"
              maxLength={20}
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mt-2"
              >
                {error}
              </motion.p>
            )}
          </Card>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          {/* Create Room */}
          <button
            onClick={() => validateAndNavigate('create')}
            className="w-full group"
          >
            <Card 
              variant="glass" 
              className="p-5 flex items-center gap-4 hover:border-cyan-accent/50 
                         hover:bg-cyan-accent/5 transition-all cursor-pointer"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-accent/20 to-cyan-accent/5 
                              border border-cyan-accent/30 flex items-center justify-center
                              group-hover:scale-110 transition-transform">
                <CreateRoomIcon size={28} className="text-cyan-accent" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-semibold text-white group-hover:text-cyan-accent transition-colors">
                  {dict.multiplayer?.createRoom || 'Create Room'}
                </h3>
                <p className="text-sm text-gray-muted">
                  {dict.multiplayer?.createRoomDesc || 'Start a new game session'}
                </p>
              </div>
            </Card>
          </button>

          {/* Join Room */}
          <button
            onClick={() => validateAndNavigate('join')}
            className="w-full group"
          >
            <Card 
              variant="glass" 
              className="p-5 flex items-center gap-4 hover:border-purple-light/50 
                         hover:bg-purple-light/5 transition-all cursor-pointer"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-light/20 to-purple-light/5 
                              border border-purple-light/30 flex items-center justify-center
                              group-hover:scale-110 transition-transform">
                <DoorEnterIcon size={28} className="text-purple-light" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-light transition-colors">
                  {dict.multiplayer?.joinRoom || 'Join Room'}
                </h3>
                <p className="text-sm text-gray-muted">
                  {dict.multiplayer?.joinRoomDesc || 'Enter an existing room'}
                </p>
              </div>
            </Card>
          </button>
        </motion.div>

        {/* Guest info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-auto pt-8"
        >
          <div className="text-center text-sm text-gray-muted">
            <p>{dict.multiplayer?.playAsGuest || 'No account required - play as guest!'}</p>
          </div>
        </motion.div>
      </main>

      <footer className="h-8" />
    </motion.div>
  );
}

