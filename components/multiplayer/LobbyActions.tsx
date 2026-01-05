'use client';

import { ActionButton } from '@components/ui/ActionButton';
import { CheckIcon, PlayIcon } from '@components/icons';

interface Player {
  id: string;
  username: string;
  is_ready: boolean;
}

interface LobbyActionsProps {
  isHost: boolean;
  isReady: boolean;
  allPlayersReady: boolean;
  hasCategories: boolean;
  onToggleReady: () => void;
  onStartGame: () => void;
  dict: Record<string, any>;
}

export function LobbyActions({
  isHost,
  isReady,
  allPlayersReady,
  hasCategories,
  onToggleReady,
  onStartGame,
  dict,
}: LobbyActionsProps) {
  const canStartGame = allPlayersReady && hasCategories;

  if (isHost) {
    return (
      <>
        <ActionButton
          onClick={onToggleReady}
          variant={isReady ? 'secondary' : 'primary'}
          icon={<CheckIcon size={20} />}
          className="mb-2"
        >
          {isReady 
            ? (dict?.multiplayer?.notReady || 'NOT READY')
            : (dict?.multiplayer?.ready || 'READY')
          }
        </ActionButton>
        <ActionButton
          onClick={onStartGame}
          variant="primary"
          icon={<PlayIcon size={20} />}
          className={!canStartGame ? 'opacity-50 cursor-not-allowed' : ''}
        >
          {dict?.multiplayer?.startGame || 'LAUNCH MISSION'}
        </ActionButton>
        <p className="text-center text-[10px] text-gray-400 mt-2 font-medium">
          {!allPlayersReady 
            ? (dict?.multiplayer?.waitingAllReady || 'Waiting for all players to be ready...')
            : !hasCategories
              ? (dict?.categories?.selectAtLeastOne || 'Select at least one category')
              : (dict?.multiplayer?.readyToStart || 'Ready to start!')
          }
        </p>
      </>
    );
  }

  return (
    <ActionButton
      onClick={onToggleReady}
      variant={isReady ? 'secondary' : 'primary'}
      icon={<CheckIcon size={20} />}
    >
      {isReady 
        ? (dict?.multiplayer?.notReady || 'NOT READY')
        : (dict?.multiplayer?.ready || 'READY')
      }
    </ActionButton>
  );
}
