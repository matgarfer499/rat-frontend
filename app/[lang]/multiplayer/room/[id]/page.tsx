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
import type { Room, Player } from '@/types/room';
import {
  ArrowLeftIcon,
  UsersIcon,
  UserIcon,
  CheckIcon,
  DetectiveIcon,
  JokerIcon,
  MaskIcon,
  RefreshIcon,
} from '@components/icons';

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
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex min-h-screen flex-col items-center justify-center px-4"
    >
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Timer */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-6xl font-bold text-cyan-accent"
        >
          {timeRemaining}
        </motion.div>

        {/* Role Card */}
        {(() => {
          const role = currentPlayer?.role;
          let borderClass = 'border-emerald-500/50 bg-gradient-to-br from-emerald-900/20 to-emerald-700/20';
          let iconBgClass = 'bg-emerald-500/20';
          let textClass = 'text-emerald-400';
          let RoleIcon = UserIcon;
          let roleLabel = dict.reveal?.youAreCivilian || 'CIVILIAN';
          let hint = '';
          
          if (role === 'impostor') {
            borderClass = 'border-red-500/50 bg-gradient-to-br from-red-900/20 to-red-700/20';
            iconBgClass = 'bg-red-500/20';
            textClass = 'text-red-400';
            RoleIcon = MaskIcon;
            roleLabel = dict.reveal?.youAreImpostor || 'IMPOSTOR';
            hint = dict.reveal?.impostorHint || "You don't know the word. Blend in!";
          } else if (role === 'detective') {
            borderClass = 'border-blue-500/50 bg-gradient-to-br from-blue-900/20 to-blue-700/20';
            iconBgClass = 'bg-blue-500/20';
            textClass = 'text-blue-400';
            RoleIcon = DetectiveIcon;
            roleLabel = dict.reveal?.youAreDetective || 'DETECTIVE';
            hint = dict.reveal?.detectiveHint || 'You can ask someone to say more words about the topic.';
          } else if (role === 'joker') {
            borderClass = 'border-yellow-500/50 bg-gradient-to-br from-yellow-900/20 to-yellow-700/20';
            iconBgClass = 'bg-yellow-500/20';
            textClass = 'text-yellow-400';
            RoleIcon = JokerIcon;
            roleLabel = dict.reveal?.youAreJoker || 'JOKER';
            hint = dict.reveal?.jokerHint || 'You know the word but want to get voted out!';
          }
          
          return (
            <Card variant="glass" className={`p-8 ${borderClass}`}>
              <div className="space-y-6">
                <div className={`w-24 h-24 mx-auto rounded-2xl flex items-center justify-center ${iconBgClass}`}>
                  <RoleIcon size={48} className={textClass} />
                </div>

                <h2 className={`text-3xl font-bold ${textClass}`}>
                  {roleLabel}
                </h2>

                {/* Word (shown to everyone except impostor) */}
                {role !== 'impostor' && currentPlayer?.word && (
                  <div className="p-4 bg-white/10 rounded-xl">
                    <p className="text-gray-muted text-sm mb-2">{dict.reveal?.yourWord || 'Your word'}</p>
                    <p className="text-3xl font-bold text-white">{currentPlayer.word}</p>
                  </div>
                )}

                {/* Hint for special roles */}
                {hint && (
                  <p className="text-gray-muted text-sm">
                    {hint}
                  </p>
                )}
              </div>
            </Card>
          );
        })()}

        <p className="text-gray-muted animate-pulse">
          {dict.reveal?.memorize || 'Memorize your role...'}
        </p>
      </div>
    </motion.div>
  );

  const renderPlaying = () => {
    const startingPlayer = room?.game_state?.starting_player_id 
      ? room.players[room.game_state.starting_player_id] 
      : null;
    
    return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-screen flex-col items-center px-4 py-6"
    >
      <div className="w-full max-w-md space-y-6">
        {/* Timer */}
        <Card variant="glass" className="p-6 text-center">
          <p className="text-gray-muted text-sm mb-2">{dict.play?.timeRemaining || 'Time Remaining'}</p>
          <div
            className={`text-5xl font-bold ${
              timeRemaining <= 30 ? 'text-red-400 animate-pulse' : 'text-cyan-accent'
            }`}
          >
            {formatTime(timeRemaining)}
          </div>
        </Card>

        {/* Starting Player */}
        {startingPlayer && (
          <Card variant="glass" className="p-4 text-center border-cyan-accent/30">
            <p className="text-gray-muted text-sm mb-2">{dict.play?.startsFirst || 'Starts first'}</p>
            <div className="flex items-center justify-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                className="w-10 h-10 rounded-full bg-cyan-accent/20 border-2 border-cyan-accent/50
                            flex items-center justify-center"
              >
                <UserIcon size={20} className="text-cyan-accent" />
              </motion.div>
              <span className="text-2xl font-bold text-cyan-accent">
                {startingPlayer.username}
              </span>
            </div>
          </Card>
        )}

        {/* Your Role */}
        {(() => {
          const role = currentPlayer?.role;
          let borderClass = 'border-emerald-500/30';
          let iconBgClass = 'bg-emerald-500/20';
          let textClass = 'text-emerald-400';
          let RoleIcon = UserIcon;
          let roleLabel = dict.play?.civilian || 'Civilian';
          
          if (role === 'impostor') {
            borderClass = 'border-red-500/30';
            iconBgClass = 'bg-red-500/20';
            textClass = 'text-red-400';
            RoleIcon = MaskIcon;
            roleLabel = dict.play?.impostor || 'Impostor';
          } else if (role === 'detective') {
            borderClass = 'border-blue-500/30';
            iconBgClass = 'bg-blue-500/20';
            textClass = 'text-blue-400';
            RoleIcon = DetectiveIcon;
            roleLabel = dict.play?.detective || 'Detective';
          } else if (role === 'joker') {
            borderClass = 'border-yellow-500/30';
            iconBgClass = 'bg-yellow-500/20';
            textClass = 'text-yellow-400';
            RoleIcon = JokerIcon;
            roleLabel = dict.play?.joker || 'Joker';
          }
          
          return (
            <Card variant="glass" className={`p-4 ${borderClass}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBgClass}`}>
                  <RoleIcon size={24} className={textClass} />
                </div>
                <div>
                  <p className="text-gray-muted text-sm">{dict.play?.youAre || 'You are'}</p>
                  <p className={`text-xl font-bold ${textClass}`}>
                    {roleLabel}
                  </p>
                </div>
                {role !== 'impostor' && currentPlayer?.word && (
                  <div className="ml-auto text-right">
                    <p className="text-gray-muted text-xs">{dict.reveal?.yourWord || 'Word'}</p>
                    <p className="text-lg font-bold text-cyan-accent">{currentPlayer.word}</p>
                  </div>
                )}
              </div>
            </Card>
          );
        })()}

        {/* Players */}
        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <UsersIcon size={18} className="text-purple-light" />
            <span className="text-white font-medium">{dict.lobby?.players || 'Players'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {playersList.map((player) => (
              <div
                key={player.id}
                className={`p-3 rounded-xl ${
                  player.wants_to_vote
                    ? 'bg-yellow-glow/10 border border-yellow-glow/30'
                    : 'bg-purple-darker/50 border border-purple-base/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium text-sm">{player.username}</span>
                  {player.id === currentPlayerId && (
                    <span className="text-xs text-purple-light">(You)</span>
                  )}
                </div>
                {player.wants_to_vote && (
                  <span className="text-xs text-yellow-glow">Wants to vote</span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Request Vote */}
        <Button
          onClick={handleRequestVote}
          variant={currentPlayer?.wants_to_vote ? 'secondary' : 'primary'}
          size="lg"
          fullWidth
          disabled={currentPlayer?.wants_to_vote}
        >
          {currentPlayer?.wants_to_vote ? (
            <>
              <CheckIcon size={18} />
              {dict.play?.voteRequested || 'Vote Requested'} ({wantsToVoteCount}/{playersList.length})
            </>
          ) : (
            <>{dict.play?.requestVote || 'Request Voting'}</>
          )}
        </Button>
      </div>
    </motion.div>
  );
  };

  const renderVoting = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-screen flex-col items-center px-4 py-6"
    >
      <div className="w-full max-w-md space-y-6">
        {/* Timer */}
        <div className="text-center">
          <motion.div
            animate={timeRemaining <= 10 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className={`text-6xl font-bold ${
              timeRemaining <= 10 ? 'text-red-400' : 'text-yellow-glow'
            }`}
          >
            {timeRemaining}
          </motion.div>
          <p className="text-gray-muted mt-2">{dict.play?.secondsToVote || 'seconds to vote'}</p>
        </div>

        <h2 className="text-2xl font-bold text-center text-white">
          {dict.play?.whoIsImpostor || 'Who is the impostor?'}
        </h2>

        {/* Vote count */}
        <div className="text-center">
          <span className="bg-purple-base/30 text-purple-light px-4 py-2 rounded-full text-sm">
            {room?.game_state?.votes_submitted || 0}/{playersList.length} votes
          </span>
        </div>

        {/* Players to vote */}
        <div className="space-y-2">
          {playersList
            .filter((p) => p.id !== currentPlayerId)
            .map((player) => (
              <button
                key={player.id}
                onClick={() => handleVote(player.id)}
                disabled={hasVoted}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  selectedVote === player.id
                    ? 'bg-purple-base border border-purple-light text-white'
                    : hasVoted
                    ? 'bg-purple-darker/30 border border-purple-base/20 text-gray-muted cursor-not-allowed'
                    : 'bg-purple-darker/50 border border-purple-base/30 text-white hover:border-purple-base/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserIcon size={24} className="text-gray-muted" />
                    <span className="font-medium">{player.username}</span>
                  </div>
                  {selectedVote === player.id && <CheckIcon size={20} className="text-cyan-accent" />}
                </div>
              </button>
            ))}
        </div>

        {hasVoted && (
          <p className="text-center text-emerald-400 font-medium">
            <CheckIcon size={18} className="inline mr-1" />
            {dict.play?.voteSubmitted || 'Vote submitted'}
          </p>
        )}
      </div>
    </motion.div>
  );

  const renderResults = () => {
    const result = room?.game_state?.result;
    const impostorId = room?.game_state?.impostor_id;
    const detectiveId = room?.game_state?.detective_id;
    const jokerId = room?.game_state?.joker_id;
    const mostVotedId = room?.game_state?.most_voted_id;
    const impostor = impostorId ? room?.players[impostorId] : null;
    const mostVoted = mostVotedId ? room?.players[mostVotedId] : null;
    
    const isImpostor = currentPlayer?.role === 'impostor';
    const isJoker = currentPlayer?.role === 'joker';
    const civiliansWon = result === 'civilians_win';
    
    // Joker wins if they got voted out
    const jokerWon = isJoker && mostVotedId === currentPlayerId;
    // Impostor wins if civilians lost AND impostor wasn't voted out
    const impostorWon = isImpostor && !civiliansWon;
    // Civilians/Detective win if they caught the impostor
    const civilianWon = !isImpostor && !isJoker && civiliansWon;
    
    const playerWon = civilianWon || impostorWon || jokerWon;
    
    // Helper to get role info for each player
    const getRoleInfo = (player: Player) => {
      if (player.id === impostorId) {
        return {
          role: 'impostor',
          label: dict.play?.impostor || 'Impostor',
          bgClass: 'bg-red-500/10 border-red-500/30',
          textClass: 'text-red-400',
          Icon: MaskIcon,
        };
      } else if (player.id === detectiveId) {
        return {
          role: 'detective',
          label: dict.play?.detective || 'Detective',
          bgClass: 'bg-blue-500/10 border-blue-500/30',
          textClass: 'text-blue-400',
          Icon: DetectiveIcon,
        };
      } else if (player.id === jokerId) {
        return {
          role: 'joker',
          label: dict.play?.joker || 'Joker',
          bgClass: 'bg-yellow-500/10 border-yellow-500/30',
          textClass: 'text-yellow-400',
          Icon: JokerIcon,
        };
      } else {
        return {
          role: 'civilian',
          label: dict.play?.civilian || 'Civilian',
          bgClass: 'bg-emerald-500/10 border-emerald-500/30',
          textClass: 'text-emerald-400',
          Icon: UserIcon,
        };
      }
    };
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-screen flex-col items-center px-4 py-6"
      >
        <div className="w-full max-w-md space-y-5">
          {/* Victory/Defeat Banner */}
          <Card
            variant="glass"
            className={`p-6 text-center ${
              playerWon ? 'border-emerald-500/50' : 'border-red-500/50'
            }`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{
                background: playerWon 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))'
                  : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(168, 85, 247, 0.2))',
              }}
            >
              {playerWon ? (
                <CheckIcon size={40} className="text-emerald-400" />
              ) : (
                <MaskIcon size={40} className="text-red-400" />
              )}
            </motion.div>
            <h1
              className={`text-3xl font-bold ${
                playerWon ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {playerWon
                ? dict.play?.victory || 'VICTORY!'
                : dict.play?.defeat || 'DEFEAT!'}
            </h1>
            <p className="text-gray-muted mt-2">
              {civiliansWon
                ? dict.play?.civiliansWon || 'Civilians caught the impostor!'
                : dict.play?.impostorWon || 'The impostor fooled everyone!'}
            </p>
          </Card>

          {/* The Word */}
          <Card variant="glass" className="p-5 text-center">
            <p className="text-gray-muted text-sm mb-2">{dict.play?.theWordWas || 'The word was'}</p>
            <p className="text-3xl font-bold text-cyan-accent">{room?.game_state?.word}</p>
          </Card>

          {/* The Impostor */}
          <Card variant="glass" className="p-5 text-center border-red-500/30">
            <p className="text-gray-muted text-sm mb-2">
              {dict.play?.theImpostorWas || 'The impostor was'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center">
                <MaskIcon size={24} className="text-red-400" />
              </div>
              <span className="text-2xl font-bold text-red-400">
                {impostor?.username || 'Unknown'}
              </span>
            </div>
          </Card>

          {/* All Players with Roles */}
          <Card variant="glass" className="p-4">
            <p className="text-gray-muted text-sm mb-3 text-center">{dict.play?.allPlayers || 'All Players'}</p>
            <div className="space-y-2">
              {playersList.map((player) => {
                const roleInfo = getRoleInfo(player);
                const RoleIcon = roleInfo.Icon;
                const wasVoted = player.id === mostVotedId;
                
                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${roleInfo.bgClass}`}
                  >
                    <div className="flex items-center gap-2">
                      <RoleIcon size={18} className={roleInfo.textClass} />
                      <span className="text-white font-medium">
                        {player.username}
                        {player.id === currentPlayerId && (
                          <span className="text-xs bg-purple-base/30 text-purple-light px-1.5 py-0.5 rounded ml-2">
                            You
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${roleInfo.textClass}`}>
                        {roleInfo.label}
                      </span>
                      {wasVoted && (
                        <span className="text-xs bg-purple-base/30 text-purple-light px-1.5 py-0.5 rounded">
                          Voted
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Back to Lobby */}
          {isHost ? (
            <Button
              onClick={handleBackToLobby}
              variant="primary"
              size="lg"
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              <RefreshIcon size={20} />
              {dict.play?.playAgain || 'Play Again'}
            </Button>
          ) : (
            <Card variant="glass" className="p-4 text-center">
              <p className="text-gray-muted">
                {dict.multiplayer?.waitingForHost || 'Waiting for host...'}
              </p>
            </Card>
          )}
        </div>
      </motion.div>
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
