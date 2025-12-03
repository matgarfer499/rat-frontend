'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  seconds: number;
  onComplete: () => void;
  isRunning: boolean;
}

export function CountdownTimer({ seconds, onComplete, isRunning }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = timeLeft / seconds;

  // Color changes as time runs out
  const getTimerColor = () => {
    if (progress > 0.5) return 'text-cyan-accent';
    if (progress > 0.25) return 'text-yellow-glow';
    return 'text-red-500';
  };

  const getGlowColor = () => {
    if (progress > 0.5) return 'shadow-[0_0_40px_rgba(6,182,212,0.5)]';
    if (progress > 0.25) return 'shadow-[0_0_40px_rgba(250,204,21,0.5)]';
    return 'shadow-[0_0_40px_rgba(239,68,68,0.5)]';
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Timer display */}
      <motion.div
        animate={timeLeft <= 10 ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.5 }}
        className={`
          relative w-48 h-48 rounded-full 
          bg-purple-deeper border-4 border-purple-base/50
          flex items-center justify-center
          ${getGlowColor()}
        `}
      >
        {/* Progress ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-purple-base/20"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className={getTimerColor()}
            initial={{ pathLength: 1 }}
            animate={{ pathLength: progress }}
            transition={{ duration: 0.5, ease: 'linear' }}
            style={{
              strokeDasharray: '553',
              strokeDashoffset: 553 * (1 - progress),
            }}
          />
        </svg>

        {/* Time text */}
        <span className={`text-5xl font-bold font-mono ${getTimerColor()}`}>
          {minutes}:{secs.toString().padStart(2, '0')}
        </span>
      </motion.div>
    </div>
  );
}
