'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Player } from '@lib/types';
import { useDictionary } from '@hooks/use-dictionary';
import { PlayerCounter } from '@components/ui/PlayerCounter';
import { PlayerInput } from '@components/ui/PlayerInput';
import { RangeSlider } from '@components/ui/RangeSlider';
import { RoleToggle } from '@components/ui/RoleToggle';
import { ToggleCard } from '@components/ui/ToggleCard';
import { ArrowLeftIcon, UsersIcon, ClockIcon, MaskIcon, DetectiveIcon, JokerIcon, PlayIcon } from '@components/icons';
import { ActionButton } from '@components/ui/ActionButton';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 12;

// Time constants (in seconds)
const DEFAULT_VOTING_TIME = 30;
const MIN_VOTING_TIME = 10;
const MAX_VOTING_TIME = 60;
const VOTING_TIME_STEP = 5;

const DEFAULT_DISCUSSION_TIME = 90;
const MIN_DISCUSSION_TIME = 30;
const MAX_DISCUSSION_TIME = 180;
const DISCUSSION_TIME_STEP = 10;

export default function SetupPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const dict = useDictionary();
  
  const [playerCount, setPlayerCount] = useState(MIN_PLAYERS);
  const [playerNames, setPlayerNames] = useState<string[]>(Array(MIN_PLAYERS).fill(''));
  const [errors, setErrors] = useState<string[]>([]);
  const [generalError, setGeneralError] = useState<string>('');
  
  // Game rules state
  const [votingTime, setVotingTime] = useState(DEFAULT_VOTING_TIME);
  const [discussionTimerEnabled, setDiscussionTimerEnabled] = useState(false);
  const [discussionTime, setDiscussionTime] = useState(DEFAULT_DISCUSSION_TIME);
  
  // Special roles state
  const [detectiveEnabled, setDetectiveEnabled] = useState(false);
  const [jokerEnabled, setJokerEnabled] = useState(false);

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    setPlayerNames((prevNames) => {
      const newNames = Array(count).fill('');
      prevNames.forEach((name, i) => {
        if (i < count) newNames[i] = name;
      });
      return newNames;
    });
    // Clear errors when count changes
    setErrors([]);
    setGeneralError('');
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
    
    // Clear specific error when user types
    if (errors[index]) {
      const newErrors = [...errors];
      newErrors[index] = '';
      setErrors(newErrors);
    }
    setGeneralError('');
  };

  // Check for duplicate names
  const duplicateIndices = useMemo(() => {
    const indices: number[] = [];
    const nameMap = new Map<string, number>();
    
    playerNames.forEach((name, index) => {
      const trimmedName = name.trim().toLowerCase();
      if (trimmedName) {
        if (nameMap.has(trimmedName)) {
          indices.push(index);
          const originalIndex = nameMap.get(trimmedName)!;
          if (!indices.includes(originalIndex)) {
            indices.push(originalIndex);
          }
        } else {
          nameMap.set(trimmedName, index);
        }
      }
    });
    
    return indices;
  }, [playerNames]);

  const validateForm = (): boolean => {
    const newErrors: string[] = Array(playerCount).fill('');
    let isValid = true;

    // Check for empty names
    playerNames.forEach((name, index) => {
      if (!name.trim()) {
        newErrors[index] = dict?.setup.validation.fillAllNames || 'Required';
        isValid = false;
      }
    });

    // Check for duplicates
    if (duplicateIndices.length > 0) {
      duplicateIndices.forEach((index) => {
        newErrors[index] = dict?.setup.validation.duplicateNames || 'Duplicate';
      });
      isValid = false;
    }

    setErrors(newErrors);
    
    if (!isValid && duplicateIndices.length > 0) {
      setGeneralError(dict?.setup.validation.duplicateNames || 'Player names must be unique');
    }

    return isValid;
  };

  const handleContinue = () => {
    if (!validateForm()) {
      return;
    }

    const players: Player[] = playerNames.map((name, index) => ({
      id: `player-${index}`,
      name: name.trim(),
      hasSeenRole: false,
    }));
    // TODO move logic to backend
    // Store in sessionStorage - use UI language as game language
    sessionStorage.setItem('gameLanguage', lang);
    sessionStorage.setItem('gamePlayers', JSON.stringify(players));
    
    // Store game rules
    sessionStorage.setItem('votingTime', String(votingTime));
    sessionStorage.setItem('discussionTimerEnabled', String(discussionTimerEnabled));
    sessionStorage.setItem('discussionTime', String(discussionTime));
    
    // Store special roles
    sessionStorage.setItem('detectiveEnabled', String(detectiveEnabled));
    sessionStorage.setItem('jokerEnabled', String(jokerEnabled));

    router.push(`/${lang}/categories`);
  };

  const handleBack = () => {
    router.push(`/${lang}`);
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
      className="relative flex min-h-screen w-full flex-col pb-32"
    >
      {/* Top App Bar */}
      <div className="sticky top-0 z-50 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 pb-2 justify-between border-b border-gray-200 dark:border-gray-800">
        <button 
          onClick={handleBack}
          className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full active:bg-gray-200 dark:active:bg-gray-800 transition-colors"
        >
          <ArrowLeftIcon size={24} />
        </button>
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">
          {dict.setup.title}
        </h2>
      </div>

      {/* Section: Player Count */}
      <PlayerCounter
        value={playerCount}
        min={MIN_PLAYERS}
        max={MAX_PLAYERS}
        onChange={handlePlayerCountChange}
        label={dict.setup.numberOfPlayers}
      />

      {/* Section: Player List */}
      <div className="px-4 pb-8">
        <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight mb-4 flex items-center gap-2">
          <UsersIcon size={24} className="text-primary" />
          {dict.setup.playersNames}
        </h3>
        
        {/* General error message */}
        {generalError && (
          <p className="text-sm text-red-400 mb-4 text-center">{generalError}</p>
        )}

        <div className="flex flex-col gap-3">
          {playerNames.map((name, index) => (
            <PlayerInput
              key={index}
              value={name}
              onChange={(value) => handlePlayerNameChange(index, value)}
              placeholder={dict.setup.playerPlaceholder.replace('{number}', String(index + 1))}
              colorIndex={index}
              error={errors[index]}
            />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 dark:bg-gray-800 mx-4 mb-8" />

      {/* Section: Timers */}
      <div className="px-4 pb-8">
        <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight mb-6 flex items-center gap-2">
          <ClockIcon size={24} className="text-primary" />
          {dict.setup.gameRules}
        </h3>

        <div className="space-y-5">
          {/* Discussion timer toggle */}
          <div className="space-y-3">
            <ToggleCard
              checked={discussionTimerEnabled}
              onChange={setDiscussionTimerEnabled}
              label={dict.setup.enableDiscussionTimer}
              description={dict.setup.enableDiscussionTimerDesc}
            />
            
            {/* Discussion time (only if enabled) */}
            <motion.div
              initial={false}
              animate={{ 
                height: discussionTimerEnabled ? 'auto' : 0,
                opacity: discussionTimerEnabled ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {discussionTimerEnabled && (
                <RangeSlider
                  value={discussionTime}
                  onChange={setDiscussionTime}
                  min={MIN_DISCUSSION_TIME}
                  max={MAX_DISCUSSION_TIME}
                  step={DISCUSSION_TIME_STEP}
                  label={dict.setup.discussionTime}
                />
              )}
            </motion.div>
          </div>

          {/* Voting time */}
          <RangeSlider
            value={votingTime}
            onChange={setVotingTime}
            min={MIN_VOTING_TIME}
            max={MAX_VOTING_TIME}
            step={VOTING_TIME_STEP}
            label={dict.setup.votingTime}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 dark:bg-gray-800 mx-4 mb-8" />

      {/* Section: Roles */}
      <div className="px-4 pb-4">
        <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight mb-4 flex items-center gap-2">
          <MaskIcon size={24} className="text-primary" />
          {dict.setup.specialRoles}
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {/* Detective role */}
          <RoleToggle
            checked={detectiveEnabled}
            onChange={setDetectiveEnabled}
            label={dict.setup.detectiveRole}
            description={dict.setup.detectiveDesc}
            icon={<DetectiveIcon size={24} />}
            iconColor="blue"
          />

          {/* Joker role */}
          <RoleToggle
            checked={jokerEnabled}
            onChange={setJokerEnabled}
            label={dict.setup.jokerRole}
            description={dict.setup.jokerDesc}
            icon={<JokerIcon size={24} />}
            iconColor="yellow"
          />
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background-light via-background-light to-transparent dark:from-background-dark dark:via-background-dark pt-12 z-40">
        <ActionButton
          onClick={handleContinue}
          variant="primary"
          icon={<PlayIcon size={20} />}
        >
          {dict.setup.continue}
        </ActionButton>
      </div>
    </motion.div>
  );
}
