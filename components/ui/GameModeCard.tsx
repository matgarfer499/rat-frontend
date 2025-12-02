'use client';

import { ReactNode } from 'react';
import { Card } from './Card';

interface GameModeCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
  accentColor?: 'purple' | 'cyan';
}

export function GameModeCard({
  title,
  description,
  icon,
  onClick,
  accentColor = 'purple',
}: GameModeCardProps) {
  const accentStyles = {
    purple: {
      iconBg: 'bg-purple-base/30',
      iconColor: 'text-purple-light',
      titleColor: 'text-white',
      hoverGlow: 'group-hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]',
    },
    cyan: {
      iconBg: 'bg-cyan-accent/20',
      iconColor: 'text-cyan-glow',
      titleColor: 'text-white',
      hoverGlow: 'group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]',
    },
  };

  const styles = accentStyles[accentColor];

  return (
    <Card
      variant="solid"
      hoverable
      className={`group p-6 flex flex-col items-center text-center gap-4 ${styles.hoverGlow}`}
    >
      <button
        onClick={onClick}
        className="w-full h-full flex flex-col items-center gap-4 focus:outline-none"
      >
        {/* Icon with circular background */}
        <div
          className={`w-16 h-16 rounded-full ${styles.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
        >
          <div className={styles.iconColor}>{icon}</div>
        </div>

        {/* Title */}
        <h3
          className={`text-xl font-bold ${styles.titleColor} tracking-wide uppercase`}
        >
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-muted text-sm leading-relaxed">{description}</p>
      </button>
    </Card>
  );
}
