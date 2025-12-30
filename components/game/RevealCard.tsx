'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion';

interface RevealCardProps {
  onRevealed: () => void;
  hasRevealed: boolean;
  children: React.ReactNode;
}

const REVEAL_THRESHOLD = -120;

export function RevealCard({
  onRevealed,
  hasRevealed,
  children,
}: RevealCardProps) {
  const [isRevealing, setIsRevealing] = useState(false);
  const constraintsRef = useRef(null);
  const controls = useAnimation();
  
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, REVEAL_THRESHOLD], [1, 0]);
  const scale = useTransform(y, [0, REVEAL_THRESHOLD], [1, 0.95]);

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

  return (
    <div ref={constraintsRef} className="relative w-full h-full">
      {/* Background - Role display (always visible behind) */}
      <div className="absolute inset-0">
        {children}
      </div>

      {/* Draggable card overlay */}
      <motion.div
        drag="y"
        dragConstraints={{ top: REVEAL_THRESHOLD, bottom: 0 }}
        dragElastic={0.1}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y, opacity, scale }}
        animate={controls}
        className="absolute inset-0 z-10 flex flex-col rounded-[2.5rem] overflow-hidden shadow-card border border-white/10 bg-[#1a2233] cursor-grab active:cursor-grabbing"
      >
        {/* Background pattern overlay */}
        <div className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay" style={{
          backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuALdk9zkiZEIhN8HrSVkTyzG5KQwlxjav9le4-y561LRLRqZoa_It4kYNtYA0OlzUhM7kgYr247eKd0CgLkxhGPt3-EbLiP_6hebfmC_YRvidkg_BxzsFSz5Ssoj4b8jeDkFl_y9PlmowwP_7TsWY-tnWgbrAZkiXv6NPx8iQXpcQYr_Xxm_MjSvKbgOZkOx2eAE8nAdKTm6zXImJW7q681LVj0UcnDOUPFIXcJjXV_dxC2b3Gx8CNQNGMneqTCNVhDMR9HLI7pQSQ")'
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-dark/50 to-background-dark/90"></div>

        {/* Content */}
        <div className="relative flex-1 flex flex-col items-center justify-end p-8 pb-10 gap-6">
          {/* Icon and Title - centered */}
          <div className="flex flex-col items-center justify-center gap-4 mb-auto mt-auto opacity-90">
            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
                <path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-1.43-2.01-2.64-.69-1.23-1.05-2.73-1.05-4.34 0-2.97 2.54-5.39 5.66-5.39s5.66 2.42 5.66 5.39c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-2.42-2.09-4.39-4.66-4.39-2.57 0-4.66 1.97-4.66 4.39 0 1.44.32 2.77.93 3.85.64 1.15 1.08 1.64 1.85 2.42.19.2.19.51 0 .71-.11.1-.24.15-.37.15zm7.17-1.85c-1.19 0-2.24-.3-3.1-.89-1.49-1.01-2.38-2.65-2.38-4.39 0-.28.22-.5.5-.5s.5.22.5.5c0 1.41.72 2.74 1.94 3.56.71.48 1.54.71 2.54.71.24 0 .64-.03 1.04-.1.27-.05.53.13.58.41.05.27-.13.53-.41.58-.57.11-1.07.12-1.21.12zM14.91 22c-.04 0-.09-.01-.13-.02-1.59-.44-2.63-1.03-3.72-2.1-1.4-1.39-2.17-3.24-2.17-5.22 0-1.62 1.38-2.94 3.08-2.94 1.7 0 3.08 1.32 3.08 2.94 0 1.07.93 1.94 2.08 1.94s2.08-.87 2.08-1.94c0-3.77-3.25-6.83-7.25-6.83-2.84 0-5.44 1.58-6.61 4.03-.39.81-.59 1.76-.59 2.8 0 .78.07 2.01.67 3.61.1.26-.03.55-.29.64-.26.1-.55-.04-.64-.29-.49-1.31-.73-2.61-.73-3.96 0-1.2.23-2.29.68-3.24 1.33-2.79 4.28-4.6 7.51-4.6 4.55 0 8.25 3.51 8.25 7.83 0 1.62-1.38 2.94-3.08 2.94s-3.08-1.32-3.08-2.94c0-1.07-.93-1.94-2.08-1.94s-2.08.87-2.08 1.94c0 1.71.66 3.31 1.87 4.51.95.94 1.86 1.46 3.27 1.85.27.07.42.35.35.61-.05.23-.26.38-.47.38z"/>
              </svg>
            </div>
            <h3 className="text-white text-2xl font-bold tracking-tight text-center">Tu Identidad Secreta</h3>
          </div>

          {/* Slide indicator */}
          <div className="w-full flex flex-col items-center gap-3 animate-pulse">
            <div className="flex flex-col items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white/50 -mb-3">
                <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white/80 -mb-3">
                <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
              </svg>
            </div>
            <p className="text-white text-base font-medium text-center">Mantén presionado y desliza</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
