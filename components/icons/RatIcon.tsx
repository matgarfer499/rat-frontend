import { IconProps } from '@/types/icon';

export function RatIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Ears */}
      <circle cx="7" cy="6" r="3" />
      <circle cx="17" cy="6" r="3" />
      {/* Head */}
      <ellipse cx="12" cy="12" rx="8" ry="7" />
      {/* Eyes */}
      <circle cx="9" cy="11" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="11" r="1.5" fill="currentColor" stroke="none" />
      {/* Nose */}
      <ellipse cx="12" cy="15" rx="2" ry="1.5" />
      {/* Whiskers */}
      <line x1="6" y1="14" x2="2" y2="13" />
      <line x1="6" y1="15" x2="2" y2="16" />
      <line x1="18" y1="14" x2="22" y2="13" />
      <line x1="18" y1="15" x2="22" y2="16" />
    </svg>
  );
}
