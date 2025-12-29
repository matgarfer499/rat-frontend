'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ActionButton } from '@components/ui/ActionButton';
import { PlayerCounter } from '@components/ui/PlayerCounter';
import { useDictionary } from '@hooks/use-dictionary';
import { createRoom } from '@lib/rooms-api';
import type { CreateRoomRequest } from '@lib/rooms-api';
import { 
  ArrowLeftIcon, 
  CreateRoomIcon, 
  LockIcon, 
  UnlockIcon,
  ShieldIcon,
} from '@components/icons';

export default function CreateRoomPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const dict = useDictionary();
  
  const [username, setUsername] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(7);
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
        category_ids: [], // Categories selected in room
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

  if (!dict) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-purple-light text-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto overflow-hidden">
      {/* Abstract Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-[400px] opacity-20 pointer-events-none z-0 bg-gradient-to-b from-primary/30 to-transparent" />
      
      {/* TopAppBar */}
      <header className="relative z-10 flex items-center p-4 pb-2 justify-between">
        <button
          onClick={() => router.push(`/${lang}/multiplayer`)}
          className="text-white flex size-10 shrink-0 items-center justify-center rounded-full active:bg-slate-800 transition-colors"
        >
          <ArrowLeftIcon size={24} />
        </button>
        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
          {dict.multiplayer?.createRoom || 'Crear Sala'}
        </h2>
        <div className="size-10" /> {/* Spacer for center alignment */}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col px-5 py-4 gap-8">
        {/* Hero / Theme Illustration */}
        <motion.div 
          className="flex flex-col items-center justify-center py-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative w-24 h-24 rounded-full bg-surface-dark flex items-center justify-center shadow-[0_0_20px_rgba(13,89,242,0.3)] border border-slate-700">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-transparent" />
            <ShieldIcon size={40} className="text-primary relative z-10" />
          </div>
          <p className="mt-3 text-sm text-slate-400 font-medium">
            {dict.multiplayer?.creatingAs || 'Creating as'} <span className="text-primary font-bold">{username}</span>
          </p>
        </motion.div>

        {/* Player Count Section */}
        <motion.section 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-surface-dark p-5 rounded-2xl shadow-sm border border-slate-800">
            <PlayerCounter
              value={maxPlayers}
              min={3}
              max={12}
              onChange={setMaxPlayers}
              label={dict.multiplayer?.maxPlayers || 'Número de Jugadores'}
            />
            <div className="mt-3 flex justify-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-primary text-xs font-bold">
                  {dict.multiplayer?.playersRange || 'Recomendado: 5+'}
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Visibility Section */}
        <motion.section 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-white text-base font-bold leading-tight px-1">
            {dict.multiplayer?.roomVisibility || 'Visibilidad de la Sala'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Public Option */}
            <button
              onClick={() => {
                setIsPublic(true);
                setPassword('');
                setError('');
              }}
              className={`relative flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${
                isPublic
                  ? 'border-primary bg-surface-dark'
                  : 'border-slate-800 bg-surface-dark hover:bg-slate-800/80'
              }`}
            >
              <div className={`flex items-center justify-center size-10 rounded-full transition-colors ${
                isPublic ? 'bg-primary text-white' : 'bg-slate-800 text-slate-500'
              }`}>
                <UnlockIcon size={24} />
              </div>
              <div className="text-center">
                <span className="block text-sm font-bold text-white">
                  {dict.multiplayer?.publicRoom || 'Pública'}
                </span>
                <span className="block text-xs text-slate-400 mt-1">
                  {dict.multiplayer?.publicRoomDescription || 'Cualquiera puede entrar'}
                </span>
              </div>
            </button>

            {/* Private Option */}
            <button
              onClick={() => setIsPublic(false)}
              className={`relative flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${
                !isPublic
                  ? 'border-primary bg-surface-dark'
                  : 'border-slate-800 bg-surface-dark hover:bg-slate-800/80'
              }`}
            >
              <div className={`flex items-center justify-center size-10 rounded-full transition-colors ${
                !isPublic ? 'bg-primary text-white' : 'bg-slate-800 text-slate-500'
              }`}>
                <LockIcon size={24} />
              </div>
              <div className="text-center">
                <span className="block text-sm font-bold text-white">
                  {dict.multiplayer?.privateRoom || 'Privada'}
                </span>
                <span className="block text-xs text-slate-400 mt-1">
                  {dict.multiplayer?.privateRoomDescription || 'Solo con invitación'}
                </span>
              </div>
            </button>
          </div>
        </motion.section>

        {/* Private Settings */}
        {!isPublic && (
          <motion.section
            className="space-y-2 pt-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              {dict.multiplayer?.security || 'Seguridad'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LockIcon size={20} className="text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                className="block w-full pl-11 pr-4 py-3.5 bg-surface-dark border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-white placeholder-slate-500 text-sm font-medium shadow-sm outline-none"
                placeholder={dict.multiplayer?.enterPassword || 'Establecer contraseña (Opcional)'}
                maxLength={20}
              />
            </div>
            <p className="text-slate-400 text-xs mt-2 px-1">
              {dict.multiplayer?.passwordHint || 'Share this password with players you want to invite'}
            </p>
          </motion.section>
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
      </main>

      {/* Fixed Bottom Action */}
      <div className="p-5 pb-8 bg-background-dark/95 backdrop-blur-sm border-t border-slate-800 z-20">
        <ActionButton
          onClick={handleCreateRoom}
          variant="primary"
          icon={<CreateRoomIcon size={20} />}
          className={loading ? 'cursor-not-allowed opacity-75' : ''}
        >
          {loading 
            ? (dict.multiplayer?.creating || 'Creating...') 
            : (dict.multiplayer?.createAndWait || 'Crear y Esperar')
          }
        </ActionButton>
      </div>
    </div>
  );
}
