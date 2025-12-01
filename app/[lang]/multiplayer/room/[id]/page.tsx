'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@components/button';
import { useDictionary } from '@hooks/use-dictionary';
import { useSocket } from '@hooks/use-socket';
import { getRoom } from '@lib/rooms-api';
import type { Room, Player } from '@/types/room';

// Game timing constants (should match backend)
const ROLE_REVEAL_DURATION = 10;
const PLAYING_DURATION = 300; // 5 minutes
const VOTING_DURATION = 30;

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
  
  // Edit username state
  const [showEditUsername, setShowEditUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);
  
  // Game state
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [selectedVote, setSelectedVote] = useState<string>('');
  const [hasVoted, setHasVoted] = useState(false);

  const { isConnected, emit, on, off } = useSocket();

  // Load initial room data
  useEffect(() => {
    const storedUsername = localStorage.getItem('temp_username');
    
    if (!storedUsername) {
      router.push(`/${lang}/multiplayer`);
      return;
    }

    setUsername(storedUsername);
    
    const loadRoom = async () => {
      try {
        const roomData = await getRoom(roomId);
        console.log('📦 Initial room data loaded:', roomData);
        setRoom(roomData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load room:', err);
        setError(dict?.multiplayer?.roomNotFound || 'Room not found');
        setLoading(false);
      }
    };

    loadRoom();
  }, [roomId, lang, router, dict]);

  // Track if we've already joined the room
  const hasJoinedRef = useRef(false);

  // Socket.IO event handlers
  useEffect(() => {
    if (!isConnected) {
      console.log('⏳ Waiting for connection...');
      return;
    }

    const storedUsername = localStorage.getItem('temp_username');
    if (!storedUsername) {
      console.log('⏳ No username found...');
      return;
    }

    console.log('🔄 Setting up Socket.IO listeners for room:', roomId);

    const storedPassword = localStorage.getItem('room_password') || '';

    if (!hasJoinedRef.current) {
      emit('join_room', {
        room_id: roomId,
        username: storedUsername,
        password: storedPassword,
      });
      hasJoinedRef.current = true;
    }

    const handleRoomState = (data: Room) => {
      console.log('📥 Received room_state:', data);
      setRoom(data);
      
      const storedPlayerId = localStorage.getItem('player_id');
      let player: Player | undefined;
      
      if (storedPlayerId && data.players[storedPlayerId]) {
        player = data.players[storedPlayerId];
      } else {
        const currentUsername = localStorage.getItem('temp_username') || '';
        player = Object.values(data.players).find(p => p.username === currentUsername);
      }
      
      if (player) {
        setCurrentPlayerId(player.id);
        setUsername(player.username);
        localStorage.setItem('player_id', player.id);
        
        // Reset vote state when entering voting phase
        if (data.phase === 'voting' && !player.vote) {
          setHasVoted(false);
          setSelectedVote('');
        } else if (player.vote) {
          setHasVoted(true);
          setSelectedVote(player.vote);
        }
      }
    };

    const handleRoomClosed = (data: { room_id: string; reason: string }) => {
      console.log('🗑️ Room closed:', data);
      const message = data.reason === 'host_left' 
        ? (dict?.multiplayer?.hostLeft || 'The host has left the room')
        : (dict?.multiplayer?.roomClosed || 'The room has been closed');
      alert(message);
      router.push(`/${lang}/multiplayer`);
    };

    const handleError = (data: { message?: string }) => {
      console.error('❌ Socket error:', data);
      if (data?.message) {
        alert(data.message);
      }
    };

    const handleVoteUpdate = (data: { votes_submitted: number; total_players: number }) => {
      console.log('🗳️ Vote update:', data);
    };

    on('room_state', handleRoomState);
    on('room_closed', handleRoomClosed);
    on('error', handleError);
    on('vote_update', handleVoteUpdate);

    return () => {
      console.log('🧹 Cleaning up Socket.IO listeners for room:', roomId);
      off('room_state', handleRoomState);
      off('room_closed', handleRoomClosed);
      off('error', handleError);
      off('vote_update', handleVoteUpdate);
      
      emit('leave_room', { room_id: roomId });
      hasJoinedRef.current = false;
    };
  }, [isConnected, roomId, emit, on, off, dict, lang, router]);

  // Timer effect for game phases
  useEffect(() => {
    if (!room || !room.game_state) {
      setTimeRemaining(0);
      return;
    }

    const phaseStartTime = room.game_state.phase_start_time * 1000; // Convert to ms
    let duration = 0;

    switch (room.phase) {
      case 'role_reveal':
        duration = ROLE_REVEAL_DURATION * 1000;
        break;
      case 'playing':
        duration = PLAYING_DURATION * 1000;
        break;
      case 'voting':
        duration = VOTING_DURATION * 1000;
        break;
      default:
        setTimeRemaining(0);
        return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - phaseStartTime;
      const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [room]);

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
    localStorage.removeItem('room_password');
    router.push(`/${lang}/multiplayer`);
  };

  const handleEditUsername = () => {
    setNewUsername(username);
    setShowEditUsername(true);
  };

  const handleSaveUsername = () => {
    const trimmedUsername = newUsername.trim();
    
    if (!trimmedUsername || trimmedUsername === username) {
      setShowEditUsername(false);
      return;
    }
    
    setSavingUsername(true);
    emit('update_username', { room_id: roomId, new_username: trimmedUsername });
    setUsername(trimmedUsername);
    localStorage.setItem('temp_username', trimmedUsername);
    setSavingUsername(false);
    setShowEditUsername(false);
  };

  const handleStartGame = () => {
    emit('start_game', { room_id: roomId, language: lang });
  };

  const handleRequestVote = () => {
    emit('request_vote', { room_id: roomId });
  };

  const handleVote = (playerId: string) => {
    if (hasVoted || playerId === currentPlayerId) return;
    
    setSelectedVote(playerId);
    setHasVoted(true);
    emit('vote', { room_id: roomId, voted_for_id: playerId });
  };

  const handleBackToLobby = () => {
    emit('back_to_lobby', { room_id: roomId });
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
  const playersList: Player[] = room && room.players ? Object.values(room.players) : [];
  const currentPlayer = playersList.find(p => p.id === currentPlayerId);
  const readyCount = playersList.filter(p => p.is_ready).length;
  const allPlayersReady = playersList.length > 0 && playersList.every(p => p.is_ready);
  const wantsToVoteCount = playersList.filter(p => p.wants_to_vote).length;

  // Render based on game phase
  const renderPhaseContent = () => {
    switch (room?.phase) {
      case 'role_reveal':
        return renderRoleReveal();
      case 'playing':
        return renderPlaying();
      case 'voting':
        return renderVoting();
      case 'results':
        return renderResults();
      default:
        return renderWaiting();
    }
  };

  const renderWaiting = () => (
    <>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          🎮 {dict.lobby?.title || 'Game Room'}
        </h1>
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">{roomId}</span>
          <button onClick={handleCopyRoomCode} className="text-sm text-purple-600 hover:text-purple-700">📋</button>
          <button onClick={handleCopyRoomLink} className="text-sm text-purple-600 hover:text-purple-700">🔗</button>
        </div>
        {shareMessage && <div className="text-sm text-green-600 font-medium">✓ {shareMessage}</div>}
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-gray-600">👤 {username}</span>
          <button onClick={handleEditUsername} className="text-xs text-purple-600 hover:text-purple-700">✏️</button>
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
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                player.is_ready ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`font-medium ${player.is_ready ? 'text-green-700' : 'text-gray-900'}`}>
                  {player.username}
                </span>
                {player.is_host && <span className="text-xs">👑</span>}
                {player.id === currentPlayerId && (
                  <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">You</span>
                )}
              </div>
              <div className={`text-sm font-medium flex items-center gap-1 ${
                player.is_ready ? 'text-green-600' : 'text-gray-400'
              }`}>
                <span className={`inline-block w-2 h-2 rounded-full ${
                  player.is_ready ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                }`}></span>
                {player.is_ready ? (dict.multiplayer?.ready || 'Ready') : (dict.multiplayer?.notReady || 'Not Ready')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          onClick={() => emit('toggle_ready', { room_id: roomId })}
          variant={currentPlayer?.is_ready ? 'secondary' : 'primary'}
          size="lg"
          fullWidth
        >
          {currentPlayer?.is_ready 
            ? `⏸️ ${dict.multiplayer?.cancelReady || 'Cancel Ready'}`
            : `✅ ${dict.multiplayer?.ready || 'Ready!'}`
          }
        </Button>

        {isHost && (
          <Button
            onClick={handleStartGame}
            size="lg"
            fullWidth
            disabled={!allPlayersReady || playersList.length < 3}
          >
            {!allPlayersReady 
              ? `⏳ Waiting for players...`
              : playersList.length < 3
                ? `👥 Need at least 3 players`
                : `🚀 Start Game`
            }
          </Button>
        )}

        <div className="text-center text-sm text-gray-600">
          {readyCount}/{playersList.length} players ready
        </div>

        <Button onClick={handleLeaveRoom} variant="ghost" size="lg" fullWidth>
          🚪 Leave Room
        </Button>
      </div>
    </>
  );

  const renderRoleReveal = () => (
    <div className="text-center space-y-8">
      {/* Timer */}
      <div className="text-6xl font-bold text-purple-600">{timeRemaining}</div>
      
      {/* Role Card */}
      <div className={`p-8 rounded-2xl ${
        currentPlayer?.role === 'impostor' 
          ? 'bg-gradient-to-br from-red-500 to-red-700' 
          : 'bg-gradient-to-br from-blue-500 to-blue-700'
      }`}>
        <div className="text-white space-y-4">
          <div className="text-8xl">
            {currentPlayer?.role === 'impostor' ? '🎭' : '👤'}
          </div>
          <h2 className="text-3xl font-bold">
            {currentPlayer?.role === 'impostor' ? 'IMPOSTOR' : 'CIVILIAN'}
          </h2>
          
          {currentPlayer?.role === 'civilian' && currentPlayer?.word && (
            <div className="mt-6 p-4 bg-white/20 rounded-xl">
              <p className="text-sm opacity-80">Your word is:</p>
              <p className="text-4xl font-bold mt-2">{currentPlayer.word}</p>
            </div>
          )}
          
          {currentPlayer?.role === 'impostor' && (
            <div className="mt-6 p-4 bg-white/20 rounded-xl">
              <p className="text-lg">
                You don&apos;t know the word!<br/>
                <span className="text-sm opacity-80">Try to blend in with the others</span>
              </p>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-gray-600 animate-pulse">Memorize your role...</p>
    </div>
  );

  const renderPlaying = () => (
    <div className="space-y-6">
      {/* Timer */}
      <div className="text-center">
        <div className={`text-5xl font-bold ${timeRemaining <= 30 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
          {formatTime(timeRemaining)}
        </div>
        <p className="text-gray-600 mt-2">Time remaining</p>
      </div>

      {/* Your Info */}
      <div className={`p-6 rounded-xl text-center ${
        currentPlayer?.role === 'impostor' 
          ? 'bg-red-50 border-2 border-red-200' 
          : 'bg-blue-50 border-2 border-blue-200'
      }`}>
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl">{currentPlayer?.role === 'impostor' ? '🎭' : '👤'}</span>
          <div className="text-left">
            <p className="text-sm text-gray-600">You are</p>
            <p className={`text-xl font-bold ${
              currentPlayer?.role === 'impostor' ? 'text-red-700' : 'text-blue-700'
            }`}>
              {currentPlayer?.role === 'impostor' ? 'The Impostor' : 'A Civilian'}
            </p>
            {currentPlayer?.role === 'civilian' && currentPlayer?.word && (
              <p className="text-lg font-semibold text-blue-600 mt-1">
                Word: <span className="bg-blue-100 px-2 py-1 rounded">{currentPlayer.word}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Players */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">👥 Players</h2>
        <div className="grid grid-cols-2 gap-2">
          {playersList.map((player) => (
            <div
              key={player.id}
              className={`p-3 rounded-lg bg-gray-50 ${
                player.wants_to_vote ? 'border-2 border-orange-400' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{player.username}</span>
                {player.is_host && <span className="text-xs">👑</span>}
                {player.id === currentPlayerId && (
                  <span className="text-xs bg-purple-100 text-purple-600 px-1 rounded">You</span>
                )}
              </div>
              {player.wants_to_vote && (
                <span className="text-xs text-orange-600">Wants to vote</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Request Vote Button */}
      <Button
        onClick={handleRequestVote}
        variant={currentPlayer?.wants_to_vote ? 'secondary' : 'primary'}
        size="lg"
        fullWidth
        disabled={currentPlayer?.wants_to_vote}
      >
        {currentPlayer?.wants_to_vote 
          ? `✓ Vote Requested (${wantsToVoteCount}/${playersList.length})`
          : `🗳️ Request Voting Phase`
        }
      </Button>
      
      <p className="text-center text-sm text-gray-500">
        Voting starts when majority requests it or time runs out
      </p>
    </div>
  );

  const renderVoting = () => (
    <div className="space-y-6">
      {/* Timer */}
      <div className="text-center">
        <div className={`text-5xl font-bold ${timeRemaining <= 10 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
          {timeRemaining}
        </div>
        <p className="text-gray-600 mt-2">Seconds to vote</p>
      </div>

      <h2 className="text-xl font-bold text-center text-gray-900">
        🗳️ Who is the impostor?
      </h2>

      {/* Vote Status */}
      <div className="text-center">
        <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
          {room?.game_state?.votes_submitted || 0}/{playersList.length} votes submitted
        </span>
      </div>

      {/* Players to vote for */}
      <div className="space-y-2">
        {playersList.filter(p => p.id !== currentPlayerId).map((player) => (
          <button
            key={player.id}
            onClick={() => handleVote(player.id)}
            disabled={hasVoted}
            className={`w-full p-4 rounded-xl text-left transition-all ${
              selectedVote === player.id
                ? 'bg-purple-600 text-white'
                : hasVoted
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👤</span>
                <span className="font-medium">{player.username}</span>
                {player.is_host && <span className="text-xs">👑</span>}
              </div>
              {selectedVote === player.id && (
                <span className="text-white">✓ Voted</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {hasVoted && (
        <p className="text-center text-green-600 font-medium">
          ✓ Your vote has been submitted
        </p>
      )}
    </div>
  );

  const renderResults = () => {
    const result = room?.game_state?.result;
    const impostorId = room?.game_state?.impostor_id;
    const mostVotedId = room?.game_state?.most_voted_id;
    const impostor = impostorId ? room?.players[impostorId] : null;
    const mostVoted = mostVotedId ? room?.players[mostVotedId] : null;
    
    const isImpostor = currentPlayer?.role === 'impostor';
    const civiliansWon = result === 'civilians_win';
    const playerWon = (isImpostor && !civiliansWon) || (!isImpostor && civiliansWon);
    
    return (
      <div className="space-y-8 text-center">
        {/* Victory/Defeat Banner */}
        <div className={`p-8 rounded-2xl ${
          playerWon 
            ? 'bg-gradient-to-br from-green-500 to-green-700' 
            : 'bg-gradient-to-br from-red-500 to-red-700'
        }`}>
          <div className="text-white space-y-4">
            <div className="text-8xl">
              {playerWon ? '🎉' : '😢'}
            </div>
            <h2 className="text-4xl font-bold">
              {playerWon ? 'VICTORY!' : 'DEFEAT!'}
            </h2>
            <p className="text-xl opacity-90">
              {civiliansWon 
                ? 'The civilians caught the impostor!' 
                : 'The impostor fooled everyone!'
              }
            </p>
          </div>
        </div>

        {/* Reveal */}
        <div className="space-y-4">
          <div className="p-6 bg-gray-50 rounded-xl">
            <p className="text-gray-600">The impostor was</p>
            <p className="text-2xl font-bold text-red-600">
              🎭 {impostor?.username || 'Unknown'}
            </p>
          </div>
          
          {mostVoted && (
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-gray-600">Most voted player</p>
              <p className="text-2xl font-bold text-purple-600">
                👤 {mostVoted.username}
                {mostVotedId === impostorId && ' ✓'}
              </p>
            </div>
          )}

          <div className="p-6 bg-blue-50 rounded-xl">
            <p className="text-gray-600">The secret word was</p>
            <p className="text-3xl font-bold text-blue-600">
              {room?.game_state?.word}
            </p>
          </div>
        </div>

        {/* Vote breakdown */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700">Vote Results:</h3>
          <div className="grid grid-cols-2 gap-2">
            {playersList.map((player) => {
              const votedFor = player.vote ? room?.players[player.vote] : null;
              return (
                <div key={player.id} className="p-2 bg-gray-50 rounded text-sm">
                  <span className="font-medium">{player.username}</span>
                  <span className="text-gray-500"> → </span>
                  <span>{votedFor?.username || '—'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Back to Lobby */}
        {isHost && (
          <Button onClick={handleBackToLobby} size="lg" fullWidth>
            🏠 Back to Lobby
          </Button>
        )}
        
        {!isHost && (
          <p className="text-gray-500">Waiting for host to return to lobby...</p>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="w-full max-w-2xl space-y-6 rounded-2xl bg-white p-8 shadow-2xl">
        {renderPhaseContent()}
      </div>

      {/* Edit Username Modal */}
      {showEditUsername && room?.phase === 'waiting' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-xl font-bold text-gray-900">✏️ Edit username</h3>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Username"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
              maxLength={20}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSaveUsername();
              }}
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveUsername} disabled={!newUsername.trim() || savingUsername} fullWidth>
                Save
              </Button>
              <Button onClick={() => setShowEditUsername(false)} variant="ghost" fullWidth>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
