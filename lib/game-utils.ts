import {
  UserIcon,
  MaskIcon,
  DetectiveIcon,
  JokerIcon,
} from '@components/icons';

export function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return {
    minutes: mins.toString().padStart(2, '0'),
    seconds: secs.toString().padStart(2, '0'),
  };
}

export type RoleType = 'civilian' | 'impostor' | 'detective' | 'joker';

export interface RoleStyleInfo {
  borderClass: string;
  bgClass: string;
  textClass: string;
  iconBgClass: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}

export interface RoleLabels {
  civilian?: string;
  impostor?: string;
  detective?: string;
  joker?: string;
}

const ROLE_STYLES: Record<RoleType, Omit<RoleStyleInfo, 'label' | 'Icon'> & { Icon: React.ComponentType<{ size?: number; className?: string }>; defaultLabel: string }> = {
  impostor: {
    borderClass: 'border-red-500/30',
    bgClass: 'bg-red-500/10',
    iconBgClass: 'bg-red-500/20',
    textClass: 'text-red-400',
    Icon: MaskIcon,
    defaultLabel: 'Impostor',
  },
  detective: {
    borderClass: 'border-blue-500/30',
    bgClass: 'bg-blue-500/10',
    iconBgClass: 'bg-blue-500/20',
    textClass: 'text-blue-400',
    Icon: DetectiveIcon,
    defaultLabel: 'Detective',
  },
  joker: {
    borderClass: 'border-yellow-500/30',
    bgClass: 'bg-yellow-500/10',
    iconBgClass: 'bg-yellow-500/20',
    textClass: 'text-yellow-400',
    Icon: JokerIcon,
    defaultLabel: 'Joker',
  },
  civilian: {
    borderClass: 'border-emerald-500/30',
    bgClass: 'bg-emerald-500/10',
    iconBgClass: 'bg-emerald-500/20',
    textClass: 'text-emerald-400',
    Icon: UserIcon,
    defaultLabel: 'Civilian',
  },
};

/**
 * Get styling info for a role
 * @param role - The role type (civilian, impostor, detective, joker)
 * @param labels - Optional custom labels for each role (from dictionary)
 */
export function getRoleStyleInfo(
  role: RoleType | string | null | undefined,
  labels?: RoleLabels
): RoleStyleInfo {
  const normalizedRole = (role || 'civilian') as RoleType;
  const styles = ROLE_STYLES[normalizedRole] || ROLE_STYLES.civilian;
  
  return {
    ...styles,
    label: labels?.[normalizedRole] || styles.defaultLabel,
  };
}
