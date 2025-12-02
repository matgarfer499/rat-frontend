'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Player } from '@lib/types';
import { useDictionary } from '@hooks/use-dictionary';
import { LanguageSelector } from '@components/layout/LanguageSelector';
import { StepIndicator, NumberStepper, Input, Card } from '@components/ui';
import { Button } from '@components/button';
import { SettingsIcon, UserIcon, ArrowLeftIcon } from '@components/icons';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 12;

export default function SetupPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const dict = useDictionary();
  
  const [playerCount, setPlayerCount] = useState(MIN_PLAYERS);
  const [playerNames, setPlayerNames] = useState<string[]>(Array(MIN_PLAYERS).fill(''));
  const [errors, setErrors] = useState<string[]>([]);
  const [generalError, setGeneralError] = useState<string>('');

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

    // Store in sessionStorage - use UI language as game language
    sessionStorage.setItem('gameLanguage', lang);
    sessionStorage.setItem('gamePlayers', JSON.stringify(players));

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

  const steps = [
    { label: dict.setup.stepSetup, isCompleted: false, isCurrent: true },
    { label: dict.setup.stepCategories, isCompleted: false, isCurrent: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex min-h-screen flex-col items-center px-4 py-6 sm:py-8"
    >
      {/* Header with language selector */}
      <header className="w-full max-w-lg flex justify-end mb-6">
        <LanguageSelector />
      </header>

      <main className="flex-1 flex flex-col w-full max-w-lg">
        {/* Step indicator */}
        <div className="mb-8">
          <StepIndicator steps={steps} />
        </div>

        {/* Title section */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-purple-base/20 border border-purple-base/40 flex items-center justify-center">
            <SettingsIcon size={24} className="text-purple-light" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{dict.setup.title}</h1>
            <p className="text-sm text-gray-muted">{dict.setup.subtitle}</p>
          </div>
        </div>

        {/* Form card */}
        <Card variant="solid" className="p-6 space-y-8">
          {/* Number of players */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 text-center">
              {dict.setup.numberOfPlayers}
            </h2>
            <NumberStepper
              value={playerCount}
              min={MIN_PLAYERS}
              max={MAX_PLAYERS}
              onChange={handlePlayerCountChange}
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-purple-base/30" />

          {/* Player names */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">
              {dict.setup.playersNames}
            </h2>
            
            {/* General error message */}
            {generalError && (
              <p className="text-sm text-red-400 mb-4 text-center">{generalError}</p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {playerNames.map((name, index) => (
                <Input
                  key={index}
                  type="text"
                  placeholder={dict.setup.playerPlaceholder.replace('{number}', String(index + 1))}
                  value={name}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  icon={<UserIcon size={18} />}
                  error={errors[index]}
                />
              ))}
            </div>
          </div>
        </Card>

        {/* Action buttons */}
        <div className="flex gap-4 mt-8">
          <Button
            variant="ghost"
            size="lg"
            onClick={handleBack}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <ArrowLeftIcon size={20} />
            {dict.common.back}
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleContinue}
            className="flex-1"
          >
            {dict.setup.continue}
          </Button>
        </div>
      </main>

      {/* Footer spacer */}
      <footer className="h-8" />
    </motion.div>
  );
}
