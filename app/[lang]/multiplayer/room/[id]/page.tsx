'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@components/button';
import { useDictionary } from '@hooks/use-dictionary';
import { useSocket } from '@hooks/use-socket';
import { getRoom } from '@lib/rooms-api';
import type { Room, Player } from '@/types/room';

export default function GameRoomPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const roomId = params.id as string;
  const dict = useDictionary();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [shareMessage, setShareMessage] = useState<string>('');

  const { isConnected, emit, on, off } = useSocket();

  useEffect(() => {
    // Get stored data
    const storedUsername = localStorage.getItem('temp_username');
    const storedPlayerId = localStorage.getItem('player_id');
    
    if (!storedUsername) {
      router.push(`/${lang}/multiplayer`);
      return;
    }

    setUsername(storedUsername);
    
    // Load room data
    const loadRoom = async () => {
      try {
        const roomData = await getRoom(roomId);
        console.log('📦 Initial room data loaded:', roomData);
        setRoom(roomData);
        setLoading(false);
      } catch (error: any) {
        console.error('❌ Failed to load room:', error);
        setError(error.message || 'Room not found');
        setLoading(false);
      }
    };

    loadRoom();
  }, [roomId, lang, router]);

  // Socket.IO event handlers
  useEffect(() => {
    if (!isConnected || !username) {
      console.log('⏳ Waiting for connection or username...', { isConnected, username });
      return;
    }

    console.log('🔄 Setting up Socket.IO listeners for room:', roomId);

    // Join room via Socket.IO
    emit('join_room', {
      room_id: roomId,
      username: username,
      password: '', // Add password support if needed
    });

    // Listen for room state updates
    const handleRoomState = (data: Room) => {
      console.log('📥 Received room_state:', data);
      setRoom(data);
      // Find current player ID
      const player = Object.values(data.players).find(p => p.username === username);
      if (player) {
        setCurrentPlayerId(player.id);
        localStorage.setItem('player_id', player.id);
      }
    };

    const handlePlayerJoined = (data: { player_id: string; username: string }) => {
      console.log(`👋 Player joined:`, data);
    };

    const handlePlayerLeft = (data: { player_id: string; username: string }) => {
      console.log(`👋 Player left:`, data);
    };

    const handleRoomClosed = (data: { room_id: string; reason: string }) => {
      console.log('🗑️ Room closed:', data);
      const message = data.reason === 'host_left' 
        ? (dict?.multiplayer?.hostLeft || 'The host has left the room')
        : (dict?.multiplayer?.roomClosed || 'The room has been closed');
      alert(message);
      router.push(`/${lang}/multiplayer`);
    };

    const handleError = (data: { message: string }) => {
      console.error('❌ Socket error:', data);
      alert(data.message);
    };

    on('room_state', handleRoomState);
    on('player_joined', handlePlayerJoined);
    on('player_left', handlePlayerLeft);
    on('room_closed', handleRoomClosed);
    on('error', handleError);

    return () => {
      console.log('🧹 Cleaning up Socket.IO listeners for room:', roomId);
      off('room_state', handleRoomState);
      off('player_joined', handlePlayerJoined);
      off('player_left', handlePlayerLeft);
      off('room_closed', handleRoomClosed);
      off('error', handleError);
      
      // Leave room on unmount
      emit('leave_room', { room_id: roomId });
    };
  }, [isConnected, username, roomId, emit, on, off]);

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    setShareMessage(dict?.multiplayer?.copyCode || 'Code copied!');
    setTimeout(() => setShareMessage(''), 2000);
  };

  const handleCopyRoomLink = () => {
    const link = `${window.location.origin}/${lang}/multiplayer/join?code=${roomId}`;
    navigator.clipboard.writeText(link);
    setShareMessage(dict?.multiplayer?.copyLink || 'Link copied!');
    setTimeout(() => setShareMessage(''), 2000);
  };

  const handleLeaveRoom = () => {
    emit('leave_room', { room_id: roomId });
    localStorage.removeItem('current_room_id');
    localStorage.removeItem('player_id');
    router.push(`/${lang}/multiplayer`);
  };

  if (!dict) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="text-white text-xl">{dict.multiplayer?.loading || 'Loading...'}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 p-4">
        <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-2xl text-center">
          <h1 className="text-2xl font-bold text-red-600">
            {dict.multiplayer?.error || 'Error'}
          </h1>
          <p className="text-gray-700">{error}</p>
          <Button onClick={() => router.push(`/${lang}/multiplayer`)} fullWidth>
            ← {dict.common?.back || 'Back'}
          </Button>
        </div>
      </div>
    );
  }

  const isHost = room && currentPlayerId === room.host_id;
  const playersList = room && room.players ? Object.values(room.players) : [];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="w-full max-w-2xl space-y-6 rounded-2xl bg-white p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            🎮 {dict.lobby?.title || 'Game Room'}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">
              {roomId}
            </span>
            <button
              onClick={handleCopyRoomCode}
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              📋
            </button>
            <button
              onClick={handleCopyRoomLink}
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              🔗
            </button>
          </div>
          {shareMessage && (
            <div className="text-sm text-green-600 font-medium">
              ✓ {shareMessage}
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-900">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Players List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            👥 {dict.lobby?.players || 'Players'} ({playersList.length}/{room?.settings?.max_players || 0})
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {playersList.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {player.username}
                  </span>
                  {player.is_host && <span className="text-xs">👑</span>}
                  {player.id === currentPlayerId && (
                    <span className="text-xs text-purple-600">(You)</span>
                  )}
                </div>
                <div className={`text-sm ${player.is_ready ? 'text-green-600' : 'text-gray-400'}`}>
                  {player.is_ready ? '✓ Ready' : 'Not Ready'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Room Info */}
        {room && (
          <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-900">Visibility:</span>
              <span className="font-medium text-gray-900">
                {room.settings?.is_public ? '🌐 Public' : '🔒 Private'}
              </span>
            </div>
            {room.settings?.password && (
              <div className="flex justify-between">
                <span className="text-gray-900">Password:</span>
                <span className="font-medium text-gray-900">🔐 Protected</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-900">Status:</span>
              <span className="font-medium capitalize text-gray-900">{room.phase}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {isHost && room?.phase === 'waiting' && (
            <Button
              onClick={() => {
                emit('game_event', {
                  room_id: roomId,
                  event_type: 'start_game',
                  payload: {}
                });
              }}
              size="lg"
              fullWidth
              disabled={playersList.length < 3}
            >
              🚀 Start Game
            </Button>
          )}

          <Button
            onClick={handleLeaveRoom}
            variant="ghost"
            size="lg"
            fullWidth
          >
            🚪 Leave Room
          </Button>
        </div>
      </div>
    </div>
  );
}
