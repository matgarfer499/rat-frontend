'use client';

import { useRouter } from 'next/navigation';
import { ActionButton } from '@components/ui/ActionButton';
import { GlobeIcon, SmartphoneIcon } from '@components/icons';
import { useDictionary } from '@hooks/use-dictionary';

interface GameActionsProps {
  lang: string;
}

export function GameActions({ lang }: GameActionsProps) {
  const router = useRouter();
  const dict = useDictionary();

  if (!dict) {
    return null;
  }

  const handleMultiplayerClick = () => {
    router.push(`/${lang}/multiplayer`);
  };

  const handleLocalClick = () => {
    router.push(`/${lang}/setup`);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-[320px] px-6">
      <ActionButton
        onClick={handleMultiplayerClick}
        variant="primary"
        icon={<GlobeIcon size={20} />}
      >
        {dict.lobby.multiplayerGame}
      </ActionButton>

      <ActionButton
        onClick={handleLocalClick}
        variant="secondary"
        icon={<SmartphoneIcon size={20} />}
      >
        {dict.lobby.localGame}
      </ActionButton>
    </div>
  );
}
