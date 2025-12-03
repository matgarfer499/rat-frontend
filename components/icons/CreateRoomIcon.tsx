'use client';

interface CreateRoomIconProps {
  size?: number;
  className?: string;
}

export function CreateRoomIcon({ size = 24, className = '' }: CreateRoomIconProps) {
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
      {/* Door frame */}
      <rect x="3" y="2" width="14" height="20" rx="2" />
      {/* Door handle */}
      <circle cx="14" cy="12" r="1" fill="currentColor" />
      {/* Plus sign */}
      <path d="M20 8v4" />
      <path d="M18 10h4" />
    </svg>
  );
}
