'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PublicRoomCard } from './PublicRoomCard';
import { UsersIcon, RefreshIcon } from '@components/icons';

interface PublicRoom {
  id: string;
  player_count: number;
  max_players: number;
}

interface PublicRoomsListProps {
  rooms: PublicRoom[];
  loading: boolean;
  loadingRooms: boolean;
  onRefresh: () => void;
  onJoinRoom: (roomId: string) => void;
  texts: {
    title: string;
    refresh: string;
    noRooms: string;
    full: string;
    waiting: string;
  };
}

export function PublicRoomsList({
  rooms,
  loading,
  loadingRooms,
  onRefresh,
  onJoinRoom,
  texts,
}: PublicRoomsListProps) {
  return (
    <motion.section 
      className="flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-white">
          {texts.title}
        </h2>
        <button
          onClick={onRefresh}
          disabled={loadingRooms}
          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-blue-400 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
        >
          <RefreshIcon size={14} className={loadingRooms ? 'animate-spin' : ''} />
          {texts.refresh}
        </button>
      </div>

      {/* List of Cards */}
      {loadingRooms ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12 bg-[#182234] rounded-2xl border border-[#314368]">
          <UsersIcon size={40} className="mx-auto text-gray-muted/30 mb-3" />
          <p className="text-[#90a4cb]">
            {texts.noRooms}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {rooms.map((room, index) => (
              <PublicRoomCard
                key={room.id}
                room={room}
                index={index}
                loading={loading}
                onJoin={onJoinRoom}
                texts={{
                  full: texts.full,
                  waiting: texts.waiting,
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.section>
  );
}
