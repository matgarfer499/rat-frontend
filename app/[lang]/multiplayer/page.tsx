'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ActionButton } from '@components/ui/ActionButton';
import { useDictionary } from '@hooks/use-dictionary';
import { 
  ArrowLeftIcon, 
  CreateRoomIcon, 
  DoorEnterIcon,
  FingerprintIcon,
  RandomIcon
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

  const generateRandomUsername = () => {
    const adjectives = ['Secret', 'Shadow', 'Silent', 'Swift', 'Clever', 'Bold', 'Dark', 'Quick'];
    const nouns = ['Agent', 'Spy', 'Fox', 'Wolf', 'Eagle', 'Phantom', 'Ghost', 'Tiger'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 1000);
    setUsername(`${randomAdj}${randomNoun}${randomNum}`);
    if (error) setError('');
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
      className="flex min-h-screen flex-col"
    >
      {/* Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-radial from-primary/15 via-transparent to-transparent z-0" />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 pt-6 pb-2">
        <button
          onClick={() => router.push(`/${lang}`)}
          className="text-white/80 hover:text-white transition-colors flex size-12 shrink-0 items-center justify-center rounded-full active:bg-white/10"
          aria-label="Go back"
        >
          <ArrowLeftIcon size={24} />
        </button>
        <h2 className="text-white/90 text-sm font-bold tracking-[0.1em] uppercase flex-1 text-center pr-12">
          {dict.multiplayer?.title || 'Online Mode'}
        </h2>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col w-full max-w-md mx-auto px-6 justify-center pb-12">
        {/* Identity Section */}
        <div className="flex flex-col items-center w-full mb-10 space-y-6">
          <motion.div 
            className="text-center space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <FingerprintIcon size={48} className="text-primary opacity-80 mb-2 mx-auto" />
            <h1 className="text-white text-3xl font-bold tracking-tight leading-tight">
              {dict.multiplayer?.username || 'Identidad'}
            </h1>
            <p className="text-slate-400 text-sm">
              {dict.multiplayer?.enterUsername || 'Introduce tu nombre en clave para la misión.'}
            </p>
          </motion.div>

          <motion.div 
            className="w-full relative group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Input Wrapper with pill shape */}
            <div className="flex w-full items-center rounded-full bg-[#182234] border border-[#314368] group-focus-within:border-primary group-focus-within:ring-1 group-focus-within:ring-primary/50 transition-all duration-300 h-14 overflow-hidden shadow-lg shadow-black/20">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError('');
                }}
                placeholder={dict.multiplayer?.enterUsername || 'Nombre de Agente...'}
                className="flex-1 bg-transparent border-none text-white placeholder:text-slate-500 focus:ring-0 px-6 text-lg font-medium h-full outline-none"
                maxLength={20}
              />
              {/* Randomize Button inside input */}
              <button
                onClick={generateRandomUsername}
                aria-label="Randomize name"
                className="h-full px-5 text-slate-400 hover:text-white hover:bg-white/5 border-l border-[#314368] transition-colors flex items-center justify-center"
              >
                <RandomIcon size={24} />
              </button>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mt-2 px-6"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        </div>

        {/* Spacer for visual breathing room */}
        <div className="h-8" />

        {/* Action Buttons */}
        <motion.div 
          className="flex flex-col gap-4 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Create Room */}
          <ActionButton
            onClick={() => validateAndNavigate('create')}
            variant="primary"
            icon={<CreateRoomIcon size={20} />}
          >
            {dict.multiplayer?.createRoom || 'Crear Sala'}
          </ActionButton>

          {/* Join Room */}
          <ActionButton
            onClick={() => validateAndNavigate('join')}
            variant="secondary"
            icon={<DoorEnterIcon size={20} />}
          >
            {dict.multiplayer?.joinRoom || 'Unirse a Sala'}
          </ActionButton>
        </motion.div>
      </main>
    </motion.div>
  );
}

