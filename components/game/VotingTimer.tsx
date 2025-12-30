'use client';

import { motion } from 'framer-motion';
import { ClockIcon } from '@components/icons';

interface VotingTimerProps {
  timeRemaining: number;
  label?: string;
  urgentThreshold?: number;
}

export function VotingTimer({ 
  timeRemaining, 
  label = 'Time remaining',
  urgentThreshold = 10 
}: VotingTimerProps) {
  const isUrgent = timeRemaining <= urgentThreshold;

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      {/* Timer Pulse Effect Background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`h-32 w-32 rounded-full blur-xl animate-pulse ${
          isUrgent ? 'bg-red-500/20' : 'bg-primary/10'
        }`} />
      </div>
      <div className="relative flex flex-col items-center gap-1 z-10">
        <motion.div
          animate={isUrgent ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className="flex items-baseline gap-1"
        >
          <span className={`text-6xl font-black tracking-tighter tabular-nums ${
            isUrgent ? 'text-red-400' : 'text-white'
          }`}>
            {timeRemaining}
          </span>
        </motion.div>
        <p className={`text-sm font-medium flex items-center gap-1 ${
          isUrgent ? 'text-red-400 animate-pulse' : 'text-white/60'
        }`}>
          <ClockIcon size={16} />
          {label}
        </p>
      </div>
    </div>
  );
}
