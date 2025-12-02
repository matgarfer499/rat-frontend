'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion';
import { LockIcon, SwipeUpIcon, CheckIcon } from '@components/icons';

interface RevealCardProps {
  onRevealed: () => void;
  hasRevealed: boolean;
  slideText: string;
  holdText: string;
  revealAgainText: string;
  children: React.ReactNode;
}

const REVEAL_THRESHOLD = -120;

export function RevealCard({
  onRevealed,
  hasRevealed,
  slideText,
  holdText,
  revealAgainText,
  children,
}: RevealCardProps) {
  const [isRevealing, setIsRevealing] = useState(false);
  const constraintsRef = useRef(null);
  const controls = useAnimation();
  
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, REVEAL_THRESHOLD], [1, 0.3]);
  const scale = useTransform(y, [0, REVEAL_THRESHOLD], [1, 0.95]);
  const backdropOpacity = useTransform(y, [0, REVEAL_THRESHOLD], [0, 1]);

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y < REVEAL_THRESHOLD) {
      setIsRevealing(true);
    } else {
      setIsRevealing(false);
    }
  };

  const handleDragEnd = () => {
    // Mark as revealed when dragged past threshold
    if (isRevealing && !hasRevealed) {
      onRevealed();
    }
    setIsRevealing(false);
    
    // Always animate back to initial position when released
    controls.start({ y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } });
  };

  // Get current instruction text based on state
  const getInstructionText = () => {
    if (isRevealing) return holdText;
    if (hasRevealed) return revealAgainText;
    return slideText;
  };

  return (
    <div ref={constraintsRef} className="relative w-full h-72">
      {/* Background - Role display (hidden behind card) */}
      <motion.div
        style={{ opacity: backdropOpacity }}
        className="absolute inset-0 rounded-2xl overflow-hidden"
      >
        {children}
      </motion.div>

      {/* Draggable card */}
      <motion.div
        drag="y"
        dragConstraints={{ top: REVEAL_THRESHOLD, bottom: 0 }}
        dragElastic={0.1}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y, opacity, scale }}
        animate={controls}
        className={`
          absolute inset-0 rounded-2xl cursor-grab active:cursor-grabbing
          bg-gradient-to-b from-purple-dark to-purple-deeper
          border-2 ${hasRevealed ? 'border-emerald-500/50' : 'border-purple-base/50'}
          flex flex-col items-center justify-center gap-4
          shadow-[0_4px_30px_rgba(0,0,0,0.5)]
          ${isRevealing ? 'border-purple-light' : ''}
        `}
      >
        {/* Swipe indicator animation */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className={hasRevealed ? 'text-emerald-400' : 'text-purple-light'}
        >
          <SwipeUpIcon size={32} />
        </motion.div>

        {/* Lock/Check icon */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center
          ${hasRevealed 
            ? 'bg-emerald-500/20 border border-emerald-500/50' 
            : 'bg-purple-base/30 border border-purple-base/50'
          }`}
        >
          {hasRevealed ? (
            <CheckIcon size={28} className="text-emerald-400" />
          ) : (
            <LockIcon size={28} className="text-purple-light" />
          )}
        </div>

        {/* Instructions */}
        <div className="text-center px-4">
          <p className={`font-semibold text-lg ${hasRevealed ? 'text-emerald-400' : 'text-white'}`}>
            {getInstructionText()}
          </p>
          <p className="text-gray-muted text-sm mt-1">
            {isRevealing ? 'Release when done' : 'Hold to keep visible'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
