'use client';

import { UserIcon, MaskIcon, DetectiveIcon, JokerIcon } from '@components/icons';

type Role = 'civilian' | 'impostor' | 'detective' | 'joker';

interface PlayerRoleCardProps {
  username: string;
  role: Role;
  isCurrentUser?: boolean;
  wasVoted?: boolean;
  roleLabels?: {
    civilian?: string;
    impostor?: string;
    detective?: string;
    joker?: string;
  };
  youLabel?: string;
  votedLabel?: string;
}

const ROLE_CONFIG = {
  civilian: {
    Icon: UserIcon,
    bgClass: 'bg-emerald-500/10 border-emerald-500/30',
    textClass: 'text-emerald-400',
    defaultLabel: 'Civilian',
  },
  impostor: {
    Icon: MaskIcon,
    bgClass: 'bg-red-500/10 border-red-500/30',
    textClass: 'text-red-400',
    defaultLabel: 'Impostor',
  },
  detective: {
    Icon: DetectiveIcon,
    bgClass: 'bg-blue-500/10 border-blue-500/30',
    textClass: 'text-blue-400',
    defaultLabel: 'Detective',
  },
  joker: {
    Icon: JokerIcon,
    bgClass: 'bg-yellow-500/10 border-yellow-500/30',
    textClass: 'text-yellow-400',
    defaultLabel: 'Joker',
  },
};

export function PlayerRoleCard({
  username,
  role,
  isCurrentUser = false,
  wasVoted = false,
  roleLabels = {},
  youLabel = 'You',
  votedLabel = 'Voted',
}: PlayerRoleCardProps) {
  const config = ROLE_CONFIG[role];
  const RoleIcon = config.Icon;
  const label = roleLabels[role] || config.defaultLabel;
  const initial = username.charAt(0).toUpperCase();

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border ${config.bgClass}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-purple-600 flex items-center justify-center text-white font-bold`}>
          {initial}
        </div>
        <div className="flex flex-col">
          <span className="text-white font-medium flex items-center gap-2">
            {username}
            {isCurrentUser && (
              <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                {youLabel}
              </span>
            )}
          </span>
          <div className="flex items-center gap-1">
            <RoleIcon size={14} className={config.textClass} />
            <span className={`text-sm font-semibold ${config.textClass}`}>
              {label}
            </span>
          </div>
        </div>
      </div>
      {wasVoted && (
        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full font-medium">
          {votedLabel}
        </span>
      )}
    </div>
  );
}
