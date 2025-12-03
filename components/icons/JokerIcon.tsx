import { IconProps } from '@/types/icon';

export function JokerIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
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
      {/* Jester hat shape */}
      <path d="M12 2C9 2 7 4 7 6c0 1.5.5 2.5 1.5 3.5" />
      <path d="M12 2c3 0 5 2 5 4 0 1.5-.5 2.5-1.5 3.5" />
      {/* Bells */}
      <circle cx="6" cy="8" r="2" />
      <circle cx="18" cy="8" r="2" />
      {/* Face */}
      <circle cx="12" cy="14" r="6" />
      {/* Smile */}
      <path d="M9 16c.5 1 1.5 1.5 3 1.5s2.5-.5 3-1.5" />
      {/* Eyes */}
      <path d="M9 13v.01" />
      <path d="M15 13v.01" />
    </svg>
  );
}
