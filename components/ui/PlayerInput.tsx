'use client';

import { UserIcon } from '@components/icons';

interface PlayerInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  colorIndex: number;
  error?: string;
}

const PLAYER_COLORS = [
  { bg: 'bg-primary/10', text: 'text-primary' },
  { bg: 'bg-purple-500/10', text: 'text-purple-500' },
  { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  { bg: 'bg-amber-500/10', text: 'text-amber-500' },
  { bg: 'bg-pink-500/10', text: 'text-pink-500' },
  { bg: 'bg-cyan-500/10', text: 'text-cyan-500' },
  { bg: 'bg-orange-500/10', text: 'text-orange-500' },
  { bg: 'bg-indigo-500/10', text: 'text-indigo-500' },
  { bg: 'bg-lime-500/10', text: 'text-lime-500' },
  { bg: 'bg-rose-500/10', text: 'text-rose-500' },
  { bg: 'bg-teal-500/10', text: 'text-teal-500' },
  { bg: 'bg-violet-500/10', text: 'text-violet-500' },
];

export function PlayerInput({ value, onChange, placeholder, colorIndex, error }: PlayerInputProps) {
  const color = PLAYER_COLORS[colorIndex % PLAYER_COLORS.length];
  
  return (
    <div className={`
      group flex w-full items-center rounded-full bg-white dark:bg-[#1f2937] p-1.5 pr-4 shadow-sm 
      ring-1 transition-all
      ${error 
        ? 'ring-red-500 ring-2' 
        : 'ring-gray-200 dark:ring-transparent focus-within:ring-2 focus-within:ring-primary'
      }
    `}>
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${color.bg} ${color.text} mr-3`}>
        <UserIcon size={20} />
      </div>
      <input 
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 font-medium focus:outline-none"
      />
    </div>
  );
}
