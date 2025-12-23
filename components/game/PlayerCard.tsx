import { UserIcon, PlayIcon } from '@components/icons';

interface PlayerCardProps {
  playerName: string;
  activeTurnLabel: string;
}

export function PlayerCard({ playerName, activeTurnLabel }: PlayerCardProps) {
  return (
    <div className="flex w-full flex-col gap-6 items-center">
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-400 
                        rounded-full blur opacity-25 group-hover:opacity-50 
                        transition duration-1000 group-hover:duration-200" />
        
        {/* Avatar Circle with Icon */}
        <div className="relative bg-gradient-to-br from-primary/20 to-blue-400/20 
                        rounded-full h-40 w-40 border-4 border-white dark:border-[#1e293b] 
                        shadow-2xl flex items-center justify-center">
          <UserIcon size={64} className="text-primary" />
        </div>

        {/* Role Badge */}
        <div className="absolute bottom-0 right-0 bg-background-light dark:bg-[#101622] 
                        rounded-full p-1.5 border border-gray-200 dark:border-gray-700 
                        shadow-sm">
          <div className="bg-primary rounded-full p-2 flex items-center justify-center">
            <PlayIcon size={20} className="text-white" />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center">
        <p className="text-primary text-3xl font-black leading-tight tracking-[-0.02em] 
                      text-center uppercase">
          {playerName}
        </p>
        <div className="flex items-center gap-2 mt-2 px-3 py-1 rounded-full 
                        bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-normal text-center">
            {activeTurnLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
