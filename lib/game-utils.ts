export function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return {
    minutes: mins.toString().padStart(2, '0'),
    seconds: secs.toString().padStart(2, '0'),
  };
}

interface RoleInfo {
  bgClass: string;
  textClass: string;
  roleLabel: string;
  IconComponent: React.ComponentType<{ size?: number; className?: string }>;
}

export function getRoleInfo(
  playerId: string,
  impostorId: string,
  detectiveId: string | null,
  jokerId: string | null,
  dict: any,
  icons: {
    UserIcon: React.ComponentType<any>;
    MaskIcon: React.ComponentType<any>;
    DetectiveIcon: React.ComponentType<any>;
    JokerIcon: React.ComponentType<any>;
  }
): RoleInfo {
  const { UserIcon, MaskIcon, DetectiveIcon, JokerIcon } = icons;
  
  const isImpostor = playerId === impostorId;
  const isDetective = playerId === detectiveId;
  const isJoker = playerId === jokerId;

  if (isImpostor) {
    return {
      bgClass: 'bg-red-500/10 border-red-500/30',
      textClass: 'text-red-400',
      roleLabel: dict.play.impostor,
      IconComponent: MaskIcon,
    };
  }
  
  if (isDetective) {
    return {
      bgClass: 'bg-blue-500/10 border-blue-500/30',
      textClass: 'text-blue-400',
      roleLabel: dict.play.detective || 'Detective',
      IconComponent: DetectiveIcon,
    };
  }
  
  if (isJoker) {
    return {
      bgClass: 'bg-yellow-500/10 border-yellow-500/30',
      textClass: 'text-yellow-400',
      roleLabel: dict.play.joker || 'Joker',
      IconComponent: JokerIcon,
    };
  }

  return {
    bgClass: 'bg-emerald-500/10 border-emerald-500/30',
    textClass: 'text-emerald-400',
    roleLabel: dict.play.civilian,
    IconComponent: UserIcon,
  };
}
