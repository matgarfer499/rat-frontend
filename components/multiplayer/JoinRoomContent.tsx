'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useDictionary } from '@hooks/use-dictionary';
import { getPublicRooms, joinRoom, checkRoom } from '@lib/rooms-api';
import type { PublicRoom, JoinRoomRequest } from '@lib/rooms-api';
import { ArrowLeftIcon } from '@components/icons';
import { RoomCodeSearch } from '@components/multiplayer/RoomCodeSearch';
import { PublicRoomsList } from '@components/multiplayer/PublicRoomsList';
import { UsernameModal } from '@components/multiplayer/UsernameModal';
import { PasswordModal } from '@components/multiplayer/PasswordModal';

export function JoinRoomContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = params.lang as string;
  const dict = useDictionary();
  
  // URL query params
  const codeFromUrl = searchParams.get('code');
  
  const [username, setUsername] = useState('');
  const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([]);
  const [roomCode, setRoomCode] = useState(codeFromUrl || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);
  
  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState<string>('');
  const [passwordError, setPasswordError] = useState('');

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
    } else {
      // No username, redirect to lobby
      router.push(`/${lang}/multiplayer`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!dict) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-game px-4">
        <div className="w-12 h-12 border-4 border-purple-light border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Decorative Background Glow */}
      <div className="fixed top-0 left-0 w-full h-96 bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none z-0" />
      
      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-4 pt-6 pb-2 bg-background-dark/80 backdrop-blur-md sticky top-0">
        <button
          onClick={() => router.push(`/${lang}/multiplayer`)}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#1e293b] transition-colors group"
        >
          <ArrowLeftIcon size={20} className="text-white group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <h1 className="text-lg font-bold tracking-tight text-white">
          {dict.multiplayer?.joinRoom || 'Unirse a Sala'}
        </h1>
        <div className="w-10" /> {/* Spacer for balance */}
      </header>

      <main className="relative z-10 flex-1 flex flex-col px-5 pb-8 max-w-lg mx-auto w-full">
        {/* Private Room Section */}
        <RoomCodeSearch
          roomCode={roomCode}
          onRoomCodeChange={setRoomCode}
          onSearch={handleJoinByCode}
          loading={loading}
          texts={{
            title: dict.multiplayer?.privateRoomCode || 'Código de sala privada',
            description: dict.multiplayer?.enterHostCode || 'Introduce el código que te ha compartido el anfitrión.',
            placeholder: dict.multiplayer?.enterRoomCode || 'CÓDIGO',
            searchButton: dict.multiplayer?.searchRoom || 'Buscar Sala',
            searching: dict.multiplayer?.searching || 'Buscando...',
          }}
        />

        {/* Divider */}
        <div className="relative py-10">
          <div aria-hidden="true" className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#314368]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background-dark px-4 text-sm font-medium text-[#64748b]">
              {dict.multiplayer?.orExplorePublic || 'O explora salas públicas'}
            </span>
          </div>
        </div>

        {/* Public Rooms List */}
        <PublicRoomsList
          rooms={publicRooms}
          loading={loading}
          loadingRooms={loadingRooms}
          onRefresh={loadPublicRooms}
          onJoinRoom={handleCheckRoom}
          texts={{
            title: dict.multiplayer?.publicRooms || 'Salas Públicas',
            refresh: dict.multiplayer?.refresh || 'Actualizar',
            noRooms: dict.multiplayer?.noPublicRooms || 'No public rooms available',
            full: dict.multiplayer?.full || 'LLENA',
            waiting: dict.multiplayer?.waiting || 'ESPERANDO',
          }}
        />
      </main>

      {/* Footer decoration (safe area) */}
      <div className="h-6 w-full bg-transparent" />

      {/* Username Modal */}
      <UsernameModal
        isOpen={showUsernameModal}
        username={username}
        onUsernameChange={setUsername}
        onSubmit={handleUsernameSubmit}
        onCancel={() => {
          setShowUsernameModal(false);
          router.push(`/${lang}/multiplayer`);
        }}
        texts={{
          title: dict.multiplayer?.enterUsername || 'Enter your username',
          subtitle: dict.multiplayer?.usernameRequired || 'Required to join',
          placeholder: dict.multiplayer?.username || 'Username',
          continue: dict.common?.continue || 'Continue',
          cancel: dict.common?.cancel || 'Cancel',
        }}
      />

      {/* Password Modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        password={password}
        error={passwordError}
        loading={loading}
        onPasswordChange={(value) => {
          setPassword(value);
          setPasswordError('');
        }}
        onSubmit={handlePasswordSubmit}
        onCancel={() => {
          setShowPasswordModal(false);
          setPassword('');
          setPasswordError('');
          setPendingRoomId('');
        }}
        texts={{
          title: dict.multiplayer?.passwordRequired || 'Password required',
          subtitle: dict.multiplayer?.privateRoomMessage || 'This room is private',
          placeholder: dict.multiplayer?.enterPassword || 'Enter password',
          join: dict.multiplayer?.join || 'Join',
          joining: dict.multiplayer?.joining || 'Joining...',
          cancel: dict.common?.cancel || 'Cancel',
        }}
      />
    </div>
  );
}
