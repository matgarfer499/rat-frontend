import { IconProps } from '@/types/icon';

export function MaskIcon({ size = 24, className = '' }: IconProps) {
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
      <path d="M12 3C7 3 3 7 3 12c0 3.5 2 6.5 5 8" />
      <path d="M21 12c0-5-4-9-9-9" />
      <path d="M16 20c3-1.5 5-4.5 5-8" />
      <circle cx="9" cy="10" r="1.5" fill="currentColor" />
      <circle cx="15" cy="10" r="1.5" fill="currentColor" />
      <path d="M9 16c.85.63 1.885 1 3 1s2.15-.37 3-1" />
    </svg>
  );
}
