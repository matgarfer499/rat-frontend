'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Player, PlayerRole } from '@lib/types';
import { getRandomWord } from '@lib/api';
import { useDictionary } from '@hooks/use-dictionary';
import { RevealCard, RevealedContent } from '@components/game';
import { ArrowLeftIcon, ArrowRightIcon } from '@components/icons';
import { PlayerBadge } from '@components/ui';
import { ActionButton } from '@components/ui/ActionButton';

export default function RevealPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const dict = useDictionary();
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [gameWord, setGameWord] = useState<string | null>(null);
  const [impostorIds, setImpostorIds] = useState<string[]>([]);
  const [detectiveId, setDetectiveId] = useState<string | null>(null);
  const [jokerId, setJokerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeGame = async () => {
      const gameLang = sessionStorage.getItem('gameLanguage') || 'en';
      const playersData = sessionStorage.getItem('gamePlayers');
      const categoriesData = sessionStorage.getItem('selectedCategories');
      const detectiveEnabled = sessionStorage.getItem('detectiveEnabled') === 'true';
      const jokerEnabled = sessionStorage.getItem('jokerEnabled') === 'true';
      const impostorCount = parseInt(sessionStorage.getItem('impostorCount') || '1', 10);
      const randomImpostorsMode = sessionStorage.getItem('randomImpostorsMode') === 'true';

      if (!playersData || !categoriesData) {
        router.push(`/${lang}/setup`);
        return;
      }

      const parsedPlayers: Player[] = JSON.parse(playersData);
      const categoryIds: number[] = JSON.parse(categoriesData);

      const wordData = await getRandomWord(categoryIds, gameLang);

      if (!wordData) {
        router.push(`/${lang}/categories`);
        return;
      }

      setGameWord(wordData.word);

      // Create array of available player indices for role assignment
      const availableIndices = parsedPlayers.map((_, i) => i);
      
      // Shuffle helper function
      const pickRandomIndex = () => {
        const randomPos = Math.floor(Math.random() * availableIndices.length);
        return availableIndices.splice(randomPos, 1)[0];
      };

      // Assign impostors
      const impostorPlayerIds: string[] = [];
      let actualImpostorCount: number;
      
      if (randomImpostorsMode) {
        // In random mode, choose a random number between 1 and total players
        actualImpostorCount = Math.floor(Math.random() * parsedPlayers.length) + 1;
      } else {
        // In normal mode, use the configured count
        actualImpostorCount = impostorCount;
      }
      
      for (let i = 0; i < actualImpostorCount && availableIndices.length > 0; i++) {
        const impostorIndex = pickRandomIndex();
        impostorPlayerIds.push(parsedPlayers[impostorIndex].id);
      }
      setImpostorIds(impostorPlayerIds);

      // Assign detective if enabled and enough players
      let detectivePlayerId: string | null = null;
      if (detectiveEnabled && availableIndices.length > 0) {
        const detectiveIndex = pickRandomIndex();
        detectivePlayerId = parsedPlayers[detectiveIndex].id;
        setDetectiveId(detectivePlayerId);
      }

      // Assign joker if enabled and enough players
      let jokerPlayerId: string | null = null;
      if (jokerEnabled && availableIndices.length > 0) {
        const jokerIndex = pickRandomIndex();
        jokerPlayerId = parsedPlayers[jokerIndex].id;
        setJokerId(jokerPlayerId);
      }

      // Assign roles to all players
      const playersWithRoles = parsedPlayers.map((player) => {
        let role: PlayerRole = 'civilian';
        let word: string | undefined = wordData.word;

        if (impostorPlayerIds.includes(player.id)) {
          role = 'impostor';
          word = undefined; // Impostor doesn't know the word
        } else if (player.id === detectivePlayerId) {
          role = 'detective';
          // Detective knows the word
        } else if (player.id === jokerPlayerId) {
          role = 'joker';
          // Joker knows the word
        }

        return {
          ...player,
          role,
          word,
          detectiveUsed: false,
        };
      });

      setPlayers(playersWithRoles);
      setLoading(false);
    };

    initializeGame();
  }, [router, lang]);

  const currentPlayer = players[currentPlayerIndex];
  const isLastPlayer = currentPlayerIndex === players.length - 1;

  const handleRevealed = () => {
    setHasRevealed(true);
  };

  const handleNext = () => {
    if (!isLastPlayer) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setHasRevealed(false);
    } else {
      sessionStorage.setItem('gameWord', gameWord || '');
      sessionStorage.setItem('impostorIds', JSON.stringify(impostorIds));
      sessionStorage.setItem('detectiveId', detectiveId || '');
      sessionStorage.setItem('jokerId', jokerId || '');
      sessionStorage.setItem('gamePlayers', JSON.stringify(players));
      router.push(`/${lang}/play`);
    }
  };

  const handleBack = () => {
    router.push(`/${lang}/categories`);
  };

  // Get role color for word display
  const getRoleColor = (role: PlayerRole) => {
    switch (role) {
      case 'civilian':
      case 'detective':
        return 'text-blue-500';
      case 'impostor':
        return 'text-red-500';
      case 'joker':
        return 'text-orange-500';
      default:
        return 'text-white';
    }
  };

  const getRoleLabel = (role: PlayerRole) => {
    switch (role) {
      case 'civilian':
        return dict?.reveal.youAreCivilian;
      case 'impostor':
        return dict?.reveal.youAreImpostor;
      case 'detective':
        return dict?.reveal.youAreDetective;
      case 'joker':
        return dict?.reveal.youAreJoker;
      default:
        return '';
    }
  };

  if (loading || !currentPlayer || !dict) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="text-xl animate-pulse text-white" />
      </div>
    );
  }

  return (
    <div className="bg-background-dark min-h-screen flex flex-col font-display antialiased overflow-hidden text-white">
      {/* Header */}
      <div className="flex items-center px-4 py-4 justify-between w-full z-20 relative">
        <button 
          onClick={handleBack}
          className="text-white/80 flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeftIcon size={24} />
        </button>
        <div className="flex flex-col items-center flex-1">
          <h2 className="text-white text-lg font-black tracking-wider uppercase">R.A.T.</h2>
          <span className="text-[10px] text-white/50 tracking-[0.2em] font-medium uppercase">
            Recognize A Traitor
          </span>
        </div>
        <div className="w-12" /> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-between w-full max-w-md mx-auto px-6 pb-8 relative z-10">
        {/* Player Info */}
        <div className="flex w-full flex-col gap-4 items-center pt-4">
          <div className="flex flex-col items-center justify-center gap-1">
            <h3 className="text-white text-2xl font-bold leading-tight tracking-tight text-center">
              Turno de {currentPlayer.name}
            </h3>
            <PlayerBadge 
              playerNumber={currentPlayerIndex + 1}
              label={dict.reveal.playerNumber}
            />
          </div>
        </div>

        {/* Reveal Card */}
        <div className="w-full relative h-[420px] my-6 group">
          {/* Background blurred card */}
          <div className="absolute inset-0 bg-primary rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center transform scale-95 opacity-50 blur-[2px] z-0">
            <p className="text-white/50 text-3xl font-black uppercase">SECRET</p>
          </div>

          {/* Main Card */}
          <RevealCard
            onRevealed={handleRevealed}
            hasRevealed={hasRevealed}
          >
            <RevealedContent
              role={currentPlayer.role || 'civilian'}
              roleLabel={getRoleLabel(currentPlayer.role || 'civilian')}
              word={currentPlayer.word}
              roleColor={getRoleColor(currentPlayer.role || 'civilian')}
              yourRoleLabel={dict.reveal.yourRole}
              yourWordLabel={dict.reveal.yourWord}
              dontKnowWordLabel={dict.reveal.dontKnowWord}
              detectiveHint={dict.reveal.detectiveHint}
              jokerHint={dict.reveal.jokerHint}
            />
          </RevealCard>
        </div>

        {/* Bottom Section - Always visible */}
        <div className="w-full flex flex-col gap-5">
          <p className="text-[#90a4cb] text-sm font-normal leading-relaxed text-center px-4">
            Memoriza tu palabra. Al soltar la tarjeta, la información se ocultará de nuevo automáticamente por seguridad.
          </p>
          <ActionButton
            onClick={handleNext}
            variant="primary"
            icon={<ArrowRightIcon size={20} />}
            className={!hasRevealed ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {isLastPlayer ? dict.reveal.startGame : dict.reveal.confirmAndPass}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
