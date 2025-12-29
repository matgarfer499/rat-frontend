'use client';

import { motion } from 'framer-motion';
import { UsersIcon, HashIcon, LockIcon, DoorEnterIcon } from '@components/icons';

interface PublicRoomCardProps {
  room: {
    id: string;
    player_count: number;
    max_players: number;
  };
  index: number;
  loading: boolean;
  onJoin: (roomId: string) => void;
  texts: {
    full: string;
    waiting: string;
  };
}

export function PublicRoomCard({
  room,
  index,
  loading,
  onJoin,
  texts,
}: PublicRoomCardProps) {
  const isFull = room.player_count >= room.max_players;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group relative bg-[#182234] rounded-2xl p-4 border border-[#314368] transition-all shadow-sm overflow-hidden ${
        isFull 
          ? 'opacity-70 cursor-not-allowed' 
          : 'hover:border-primary/50 cursor-pointer'
      }`}
      onClick={() => !isFull && !loading && onJoin(room.id)}
    >
      {/* Hover Effect Background */}
      {!isFull && (
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.03] transition-colors pointer-events-none" />
      )}
      
      <div className="flex items-center gap-4 relative z-10">
        {/* Avatar with status indicator */}
        <div className="relative flex-shrink-0">
          <div className={`h-14 w-14 rounded-full bg-gradient-to-br from-primary/80 to-purple-600 flex items-center justify-center text-white font-bold border-2 border-[#314368] text-lg ${
            isFull ? 'grayscale' : ''
          }`}>
            H
          </div>
          {!isFull && (
            <div className="absolute -bottom-1 -right-1 bg-[#182234] p-0.5 rounded-full">
              <div className="bg-green-500 h-3 w-3 rounded-full border-2 border-[#182234]" />
            </div>
          )}
        </div>

        {/* Room Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#64748b] flex items-center gap-1.5">
              <HashIcon size={16} className="text-[#64748b]" />
              <span className="font-mono font-bold text-white">{room.id}</span>
            </span>
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold ring-1 ring-inset ${
              isFull
                ? 'bg-slate-500/10 text-slate-400 ring-slate-500/20'
                : 'bg-green-500/10 text-green-400 ring-green-500/20'
            }`}>
              {isFull ? texts.full : texts.waiting}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <UsersIcon size={18} className="text-[#90a4cb]" />
            <span className="text-base font-bold">
              <span className={isFull ? 'text-slate-400' : 'text-white'}>
                {room.player_count}
              </span>
              <span className="text-[#64748b]">/{room.max_players}</span>
            </span>
          </div>
        </div>

        {/* Join Button */}
        <button
          className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full shadow-md transition-transform ${
            isFull
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
              : 'bg-primary text-white hover:scale-105 active:scale-95'
          }`}
          disabled={isFull || loading}
        >
          {isFull ? (
            <LockIcon size={20} />
          ) : (
            <DoorEnterIcon size={20} />
          )}
        </button>
      </div>
    </motion.div>
  );
}
