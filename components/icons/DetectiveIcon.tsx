import { IconProps } from '@/types/icon';

export function DetectiveIcon({ size = 24, className = '' }: IconProps) {
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
      {/* Magnifying glass */}
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
      {/* Eye in center */}
      <circle cx="11" cy="11" r="3" />
      <circle cx="11" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}
