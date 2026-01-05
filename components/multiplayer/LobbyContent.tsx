'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlayerCard } from '@components/multiplayer/PlayerCard';
import { LobbyActions } from '@components/multiplayer/LobbyActions';
import { CollapsibleSection } from '@components/ui/CollapsibleSection';
import { RangeSlider } from '@components/ui/RangeSlider';
import { ToggleCard } from '@components/ui/ToggleCard';
import { RoleToggle } from '@components/ui/RoleToggle';
import { CategoryCard } from '@components/ui/CategoryCard';
import { ActionButton } from '@components/ui/ActionButton';
import {
  ArrowLeftIcon,
  ShareIcon,
  ClockIcon,
  FolderIcon,
  DetectiveIcon,
  JokerIcon,
  CheckIcon,
  RandomIcon,
} from '@components/icons';
import { getCategories } from '@lib/rooms-api';

interface Player {
  id: string;
  username: string;
  is_ready: boolean;
}

interface Room {
  id: string;
  host_id: string;
  max_players: number;
  players: Record<string, Player>;
  phase: string;
}

interface Category {
  id: number;
  key: string;
  translations: Array<{
    language: string;
    name: string;
  }>;
}

interface LobbyContentProps {
  room: Room;
  currentPlayerId: string;
  lang: string;
  votingTime: number;
  discussionTimerEnabled: boolean;
  discussionTime: number;
  detectiveEnabled: boolean;
  jokerEnabled: boolean;
  selectedCategories: number[];
  onVotingTimeChange: (value: number) => void;
  onDiscussionTimerToggle: (enabled: boolean) => void;
  onDiscussionTimeChange: (value: number) => void;
  onDetectiveToggle: (enabled: boolean) => void;
  onJokerToggle: (enabled: boolean) => void;
  onCategoriesChange: (categories: number[]) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  onShareLink: () => void;
  onToggleReady: () => void;
  shareMessage: string;
  dict: Record<string, any>;
}

const MIN_VOTING_TIME = 15;
const MAX_VOTING_TIME = 180;
const VOTING_TIME_STEP = 15;

const MIN_DISCUSSION_TIME = 60;
const MAX_DISCUSSION_TIME = 600;
const DISCUSSION_TIME_STEP = 30;

export function LobbyContent({
  room,
  currentPlayerId,
  lang,
  votingTime,
  discussionTimerEnabled,
  discussionTime,
  detectiveEnabled,
  jokerEnabled,
  selectedCategories,
  onVotingTimeChange,
  onDiscussionTimerToggle,
  onDiscussionTimeChange,
  onDetectiveToggle,
  onJokerToggle,
  onCategoriesChange,
  onStartGame,
  onLeaveRoom,
  onShareLink,
  onToggleReady,
  shareMessage,
  dict,
}: LobbyContentProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRandomMode, setIsRandomMode] = useState(false);

  const isHost = currentPlayerId === room.host_id;
  const playersList = Object.values(room.players);
  const allPlayersReady = playersList.length >= 3 && playersList.every(p => p.is_ready);
  const emptySlots = room.max_players - playersList.length;

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories(lang);
        setCategories(cats);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, [lang]);

  const handleSelectAll = () => {
    if (isRandomMode) return;
    
    const allIds = filteredCategories.map(c => c.id);
    const allSelected = allIds.every(id => selectedCategories.includes(id));
    
    if (allSelected) {
      onCategoriesChange([]);
    } else {
      onCategoriesChange(allIds);
    }
  };

  const handleRandomSelection = () => {
    if (isRandomMode) {
      setIsRandomMode(false);
      onCategoriesChange([]);
      return;
    }
    
    if (categories.length === 0) return;
    
    const count = Math.min(
      Math.floor(Math.random() * 3) + 3,
      categories.length
    );
    
    const shuffled = [...categories].sort(() => Math.random() - 0.5);
    const randomIds = shuffled.slice(0, count).map(c => c.id);
    
    setIsRandomMode(true);
    onCategoriesChange(randomIds);
    setSearchQuery('');
  };

  const toggleCategory = (categoryId: number) => {
    if (isRandomMode) return;
    
    onCategoriesChange(
      selectedCategories.includes(categoryId)
        ? selectedCategories.filter(id => id !== categoryId)
        : [...selectedCategories, categoryId]
    );
  };

  const filteredCategories = categories.filter(category => {
    const translation = category.translations.find(t => t.language === lang);
    const name = translation?.name || category.translations[0]?.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const allSelected = filteredCategories.length > 0 && 
    filteredCategories.every(cat => selectedCategories.includes(cat.id));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-screen flex-col"
    >
      {/* Header */}
      <header className="flex items-center justify-between p-4 pb-2 bg-background-light dark:bg-background-dark sticky top-0 z-20">
        <button
          onClick={onLeaveRoom}
          className="text-gray-900 dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeftIcon size={24} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-primary tracking-widest uppercase">
            Lobby ID
          </span>
          <h2 className="text-gray-900 dark:text-white text-2xl font-bold leading-tight tracking-tight">
            {room.id}
          </h2>
        </div>
        <div className="relative">
          <button
            onClick={onShareLink}
            className="text-primary flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <ShareIcon size={20} />
          </button>
          {shareMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-14 right-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap"
            >
              {shareMessage}
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pb-32">
        {/* Player Count Headline */}
        <div className="py-6 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Online
          </div>
          <h3 className="text-gray-900 dark:text-white text-2xl font-bold">
            {playersList.length}/{room.max_players} {dict?.multiplayer?.playersConnected || 'Players Connected'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {allPlayersReady 
              ? (dict?.multiplayer?.allReady || 'Everyone is ready!')
              : (dict?.multiplayer?.waitingPlayers || 'Waiting for players to join...')
            }
          </p>
        </div>

        {/* Player List */}
        <div className="space-y-3 mb-8">
          {playersList.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              isHost={player.id === room.host_id}
              isCurrentUser={player.id === currentPlayerId}
              isRoomHost={false}
            />
          ))}
          
          {/* Empty Slots */}
          {Array.from({ length: emptySlots }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="flex items-center gap-4 border-2 border-dashed border-gray-300 dark:border-gray-700 p-3 rounded-2xl bg-transparent opacity-60"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-400">
                <span className="text-2xl">+</span>
              </div>
              <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">
                {dict?.multiplayer?.waitingForPlayer || 'Waiting for player...'}
              </p>
            </div>
          ))}
        </div>

        {/* Settings Section (only for host) */}
        {isHost && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1">
              {dict?.setup?.gameConfiguration || 'Game Configuration'}
            </h4>

            {/* Categories */}
            <CollapsibleSection
              title={dict?.categories?.title || 'Categories'}
              subtitle={`${selectedCategories.length} ${dict?.categories?.selected || 'selected'}`}
              icon={<FolderIcon size={20} />}
            >
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    disabled={isRandomMode}
                    className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full transition-colors pl-3 pr-4 ${
                      allSelected && !isRandomMode
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    } ${isRandomMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <CheckIcon size={16} />
                    <span className="text-sm font-medium">{dict?.categories?.selectAll || 'Select All'}</span>
                  </button>
                  
                  <button
                    onClick={handleRandomSelection}
                    className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full transition-colors pl-3 pr-4 ${
                      isRandomMode
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <RandomIcon size={16} />
                    <span className="text-sm font-medium">{dict?.categories?.random || 'Random'}</span>
                  </button>
                </div>

                {isRandomMode && (
                  <p className="text-sm text-primary text-center">
                    {dict?.categories?.randomMode || 'Random categories selected'}
                  </p>
                )}

                {/* Category Grid */}
                {loadingCategories ? (
                  <div className="text-center py-4 text-sm text-gray-500">
                    {dict?.categories?.loading || 'Loading...'}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {filteredCategories.map(category => {
                      const translation = category.translations.find(t => t.language === lang);
                      const name = translation?.name || category.translations[0]?.name || '';
                      const isSelected = isRandomMode ? false : selectedCategories.includes(category.id);

                      return (
                        <CategoryCard
                          key={category.id}
                          id={category.id}
                          name={name}
                          isSelected={isSelected}
                          onToggle={() => toggleCategory(category.id)}
                          disabled={isRandomMode}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Timers */}
            <CollapsibleSection
              title={dict?.setup?.gameRules || 'Timers'}
              subtitle={dict?.setup?.configureTimers || 'Configure game timers'}
              icon={<ClockIcon size={20} />}
            >
              <div className="space-y-4">
                <ToggleCard
                  checked={discussionTimerEnabled}
                  onChange={onDiscussionTimerToggle}
                  label={dict?.setup?.enableDiscussionTimer || 'Discussion Timer'}
                  description={dict?.setup?.enableDiscussionTimerDesc || 'Enable timer for discussion phase'}
                />
                
                {discussionTimerEnabled && (
                  <RangeSlider
                    value={discussionTime}
                    onChange={onDiscussionTimeChange}
                    min={MIN_DISCUSSION_TIME}
                    max={MAX_DISCUSSION_TIME}
                    step={DISCUSSION_TIME_STEP}
                    label={dict?.setup?.discussionTime || 'Discussion Time'}
                  />
                )}

                <RangeSlider
                  value={votingTime}
                  onChange={onVotingTimeChange}
                  min={MIN_VOTING_TIME}
                  max={MAX_VOTING_TIME}
                  step={VOTING_TIME_STEP}
                  label={dict?.setup?.votingTime || 'Voting Time'}
                />
              </div>
            </CollapsibleSection>

            {/* Special Roles */}
            <CollapsibleSection
              title={dict?.setup?.specialRoles || 'Special Roles'}
              subtitle={dict?.setup?.enableSpecialRoles || 'Enable special roles'}
              icon={<DetectiveIcon size={20} />}
            >
              <div className="space-y-3">
                <RoleToggle
                  checked={detectiveEnabled}
                  onChange={onDetectiveToggle}
                  label={dict?.setup?.detectiveRole || 'Detective'}
                  description={dict?.setup?.detectiveDesc || 'Knows the secret word'}
                  icon={<DetectiveIcon size={24} />}
                  iconColor="blue"
                />

                <RoleToggle
                  checked={jokerEnabled}
                  onChange={onJokerToggle}
                  label={dict?.setup?.jokerRole || 'Joker'}
                  description={dict?.setup?.jokerDesc || 'Wins if voted out'}
                  icon={<JokerIcon size={24} />}
                  iconColor="yellow"
                />
              </div>
            </CollapsibleSection>
          </div>
        )}
      </main>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background-light via-background-light to-transparent dark:from-background-dark dark:via-background-dark pt-12 z-10">
        <LobbyActions
          isHost={isHost}
          isReady={room.players[currentPlayerId]?.is_ready ?? false}
          allPlayersReady={allPlayersReady}
          hasCategories={selectedCategories.length > 0}
          onToggleReady={onToggleReady}
          onStartGame={onStartGame}
          dict={dict}
        />
      </div>
    </motion.div>
  );
}
