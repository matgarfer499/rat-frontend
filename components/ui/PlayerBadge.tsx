import { ShieldIcon } from '@components/icons';

interface PlayerBadgeProps {
  playerNumber: number;
  label: string;
}

export function PlayerBadge({ playerNumber, label }: PlayerBadgeProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
      <ShieldIcon size={14} className="text-primary" />
      <p className="text-white/70 text-xs font-bold uppercase tracking-wide">
        {label.replace('{number}', String(playerNumber))}
      </p>
    </div>
  );
}
