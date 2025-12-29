'use client';

import { motion } from 'framer-motion';
import { ActionButton } from '@components/ui/ActionButton';
import { Input } from '@components/ui/Input';
import { HashIcon, SearchIcon } from '@components/icons';

interface RoomCodeSearchProps {
  roomCode: string;
  onRoomCodeChange: (code: string) => void;
  onSearch: () => void;
  loading: boolean;
  texts: {
    title: string;
    description: string;
    placeholder: string;
    searchButton: string;
    searching: string;
  };
}

export function RoomCodeSearch({
  roomCode,
  onRoomCodeChange,
  onSearch,
  loading,
  texts,
}: RoomCodeSearchProps) {
  return (
    <motion.section 
      className="mt-6 flex flex-col gap-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-white">
          {texts.title}
        </h2>
        <p className="text-sm text-[#90a4cb]">
          {texts.description}
        </p>
      </div>
      
      <div className="flex flex-col gap-4">
        <Input
          type="text"
          value={roomCode}
          onChange={(e) => onRoomCodeChange(e.target.value.toUpperCase())}
          placeholder={texts.placeholder}
          maxLength={16}
          icon={<HashIcon size={20} />}
          onKeyPress={(e) => {
            if (e.key === 'Enter') onSearch();
          }}
          className="h-16 text-xl font-bold tracking-[0.2em] uppercase"
        />
        
        <ActionButton
          onClick={onSearch}
          variant="primary"
          icon={<SearchIcon size={20} />}
          className={(!roomCode.trim() || loading) ? 'cursor-not-allowed opacity-50' : ''}
        >
          {loading ? texts.searching : texts.searchButton}
        </ActionButton>
      </div>
    </motion.section>
  );
}
