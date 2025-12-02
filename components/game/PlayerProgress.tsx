interface PlayerProgressProps {
  current: number;
  total: number;
}

export function PlayerProgress({ current, total }: PlayerProgressProps) {
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={`
            h-2 rounded-full transition-all duration-300
            ${index === current
              ? 'w-6 bg-purple-light shadow-[0_0_10px_rgba(168,85,247,0.5)]'
              : index < current
                ? 'w-2 bg-purple-base'
                : 'w-2 bg-gray-dark'
            }
          `}
        />
      ))}
    </div>
  );
}
