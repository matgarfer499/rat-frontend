import { formatTime } from '@lib/game-utils';

interface DiscussionTimerProps {
  remainingTime: number;
  minutesLabel: string;
  secondsLabel: string;
}

export function DiscussionTimer({
  remainingTime,
  minutesLabel,
  secondsLabel,
}: DiscussionTimerProps) {
  const { minutes, seconds } = formatTime(remainingTime);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex gap-4 w-full">
        {/* Minutes */}
        <div className="flex grow basis-0 flex-col items-center gap-2">
          <div className="flex h-24 w-full items-center justify-center rounded-2xl 
                          bg-white dark:bg-[#1e293b] shadow-lg ring-1 ring-gray-900/5 
                          dark:ring-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 
                            opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-5xl font-black leading-tight tracking-[-0.03em] text-primary">
              {minutes}
            </p>
          </div>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400">
            {minutesLabel}
          </p>
        </div>

        {/* Colon Separator */}
        <div className="flex h-24 flex-col items-center justify-center pt-2">
          <div className="flex flex-col gap-3">
            <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>
        </div>

        {/* Seconds */}
        <div className="flex grow basis-0 flex-col items-center gap-2">
          <div className="flex h-24 w-full items-center justify-center rounded-2xl 
                          bg-white dark:bg-[#1e293b] shadow-lg ring-1 ring-gray-900/5 
                          dark:ring-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 
                            opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-5xl font-black leading-tight tracking-[-0.03em] text-primary">
              {seconds}
            </p>
          </div>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400">
            {secondsLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
