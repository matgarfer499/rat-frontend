'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@components/button';
import { Card } from '@components/ui';
import { useDictionary } from '@hooks/use-dictionary';
import { useSocket } from '@hooks/use-socket';
import { getRoom, getCategories } from '@lib/rooms-api';
import { LobbyContent } from '@components/multiplayer/LobbyContent';
import { PlayingContent } from '@components/multiplayer/PlayingContent';
import { RoleRevealContent } from '@components/multiplayer/RoleRevealContent';
import { VotingContent } from '@components/multiplayer/VotingContent';
import { ResultsContent } from '@components/multiplayer/ResultsContent';
import { ArrowLeftIcon } from '@components/icons';
import type { Room, Player } from '@/types/room';

interface Category {
  id: number;
  key: string;
  translations: Array<{
    language: string;
    name: string;
  }>;
}

// Game timing constants (should match backend)
const ROLE_REVEAL_DURATION = 10;
const PLAYING_DURATION = 300; // 5 minutes
const VOTING_DURATION = 30;

// Time constants for settings
const DEFAULT_VOTING_TIME = 60;
const MIN_VOTING_TIME = 15;
const MAX_VOTING_TIME = 180;
const VOTING_TIME_STEP = 15;

const DEFAULT_DISCUSSION_TIME = 300;
const MIN_DISCUSSION_TIME = 60;
const MAX_DISCUSSION_TIME = 600;
const DISCUSSION_TIME_STEP = 30;

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
  
  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([1]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Host settings (only for host)
  const [votingTime, setVotingTime] = useState(DEFAULT_VOTING_TIME);
  const [discussionTimerEnabled, setDiscussionTimerEnabled] = useState(false);
  const [discussionTime, setDiscussionTime] = useState(DEFAULT_DISCUSSION_TIME);
  const [detectiveEnabled, setDetectiveEnabled] = useState(false);
  const [jokerEnabled, setJokerEnabled] = useState(false);
  
  // Edit username state
  const [showEditUsername, setShowEditUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);
  
  // Game state
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [selectedVote, setSelectedVote] = useState<string>('');
  const [hasVoted, setHasVoted] = useState(false);

  const { isConnected, emit, on, off } = useSocket();
  
  // Track if we've already joined the room
  const hasJoinedRef = useRef(false);

  // Load initial room data
  useEffect(() => {
    const storedUsername = localStorage.getItem('temp_username');
    
    if (!storedUsername) {
      router.push(`/${lang}/multiplayer`);
      return;
    }

    setUsername(storedUsername);
    
    const loadData = async () => {
      try {
        const [roomData, categoriesData] = await Promise.all([
          getRoom(roomId),
          getCategories(lang),
        ]);
        console.log('📦 Initial room data loaded:', roomData);
        setRoom(roomData);
        setCategories(categoriesData);
        if (categoriesData.length > 0) {
          setSelectedCategories([categoriesData[0].id]);
        }
        setLoading(false);
        setLoadingCategories(false);
      } catch (err) {
        console.error('Failed to load room:', err);
        setError(dict?.multiplayer?.roomNotFound || 'Room not found');
        setLoading(false);
        setLoadingCategories(false);
      }
    };

    loadData();
  }, [roomId, lang, router, dict]);

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
    emit('start_game', { 
      room_id: roomId, 
      language: lang,
      category_ids: selectedCategories,
      settings: {
        voting_time: votingTime,
        discussion_timer_enabled: discussionTimerEnabled,
        discussion_time: discussionTime,
        detective_enabled: detectiveEnabled,
        joker_enabled: jokerEnabled,
      },
    });
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

  const handleToggleReady = () => {
    emit('toggle_ready', { room_id: roomId });
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!dict) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-purple-light text-xl animate-pulse" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-purple-light text-xl animate-pulse">
          {dict.multiplayer?.loading || 'Loading...'}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-screen flex-col items-center justify-center px-4"
      >
        <Card variant="glass" className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            {dict.multiplayer?.error || 'Error'}
          </h1>
          <p className="text-gray-muted mb-6">{error}</p>
          <Button onClick={() => router.push(`/${lang}/multiplayer`)} fullWidth>
            <ArrowLeftIcon size={18} />
            {dict.common?.back || 'Back'}
          </Button>
        </Card>
      </motion.div>
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

  const renderWaiting = () => {
    if (!room) return null;
    
    return (
      <LobbyContent
        room={room}
        currentPlayerId={currentPlayerId}
        username={username}
        lang={lang}
        votingTime={votingTime}
        discussionTimerEnabled={discussionTimerEnabled}
        discussionTime={discussionTime}
        detectiveEnabled={detectiveEnabled}
        jokerEnabled={jokerEnabled}
        selectedCategories={selectedCategories}
        onVotingTimeChange={setVotingTime}
        onDiscussionTimerToggle={setDiscussionTimerEnabled}
        onDiscussionTimeChange={setDiscussionTime}
        onDetectiveToggle={setDetectiveEnabled}
        onJokerToggle={setJokerEnabled}
        onCategoriesChange={setSelectedCategories}
        onStartGame={handleStartGame}
        onLeaveRoom={handleLeaveRoom}
        onShareCode={handleCopyRoomCode}
        onShareLink={handleCopyRoomLink}
        onToggleReady={handleToggleReady}
        shareMessage={shareMessage}
        dict={dict}
      />
    );
  };

  const renderRoleReveal = () => (
    <RoleRevealContent
      currentPlayer={currentPlayer || null}
      timeRemaining={timeRemaining}
      dict={dict}
    />
  );

  const renderPlaying = () => {
    if (!room) return null;
    
    return (
      <PlayingContent
        room={room}
        currentPlayerId={currentPlayerId}
        timeRemaining={timeRemaining}
        discussionTime={discussionTime}
        onRequestVote={handleRequestVote}
        dict={dict}
      />
    );
  };

  const renderVoting = () => (
    <VotingContent
      players={playersList}
      currentPlayerId={currentPlayerId}
      timeRemaining={timeRemaining}
      votesSubmitted={room?.game_state?.votes_submitted || 0}
      hasVoted={hasVoted}
      selectedVote={selectedVote}
      onVote={handleVote}
      dict={dict}
    />
  );

  const renderResults = () => {
    if (!room?.game_state) return null;
    
    return (
      <ResultsContent
        players={playersList}
        currentPlayerId={currentPlayerId}
        gameState={{
          word: room.game_state.word || '',
          impostor_id: room.game_state.impostor_id || '',
          detective_id: room.game_state.detective_id,
          joker_id: room.game_state.joker_id,
          most_voted_id: room.game_state.most_voted_id,
          result: room.game_state.result,
        }}
        isHost={isHost || false}
        onPlayAgain={handleBackToLobby}
        dict={dict}
      />
    );
  };

  return (
    <>
      <AnimatePresence mode="wait">{renderPhaseContent()}</AnimatePresence>

      {/* Edit Username Modal */}
      {showEditUsername && room?.phase === 'waiting' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card variant="glass" className="p-6 max-w-sm w-full space-y-4">
              <h3 className="text-xl font-bold text-white">
                {dict.multiplayer?.editUsername || 'Edit Username'}
              </h3>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder={dict.multiplayer?.username || 'Username'}
                className="w-full bg-purple-darker/50 border border-purple-base/30 rounded-xl 
                           px-4 py-3 text-white placeholder-gray-muted/50
                           focus:border-cyan-accent/50 focus:outline-none focus:ring-2 focus:ring-cyan-accent/20"
                autoFocus
                maxLength={20}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSaveUsername();
                }}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveUsername}
                  disabled={!newUsername.trim() || savingUsername}
                  fullWidth
                >
                  {dict.common?.save || 'Save'}
                </Button>
                <Button onClick={() => setShowEditUsername(false)} variant="ghost" fullWidth>
                  {dict.common?.cancel || 'Cancel'}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </>
  );
}
