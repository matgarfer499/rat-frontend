'use client';

interface DoorEnterIconProps {
  size?: number;
  className?: string;
}

export function DoorEnterIcon({ size = 24, className = '' }: DoorEnterIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M13 4h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
      <path d="M11 16l4-4-4-4" />
      <path d="M15 12H3" />
    </svg>
  );
}
