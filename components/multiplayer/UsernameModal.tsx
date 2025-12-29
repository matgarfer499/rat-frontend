'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ActionButton } from '@components/ui/ActionButton';
import { UserIcon } from '@components/icons';

interface UsernameModalProps {
  isOpen: boolean;
  username: string;
  onUsernameChange: (username: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  texts: {
    title: string;
    subtitle: string;
    placeholder: string;
    continue: string;
    cancel: string;
  };
}

export function UsernameModal({
  isOpen,
  username,
  onUsernameChange,
  onSubmit,
  onCancel,
  texts,
}: UsernameModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-[#182234] border border-[#314368] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-accent/20 flex items-center justify-center">
                <UserIcon size={24} className="text-cyan-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {texts.title}
                </h3>
                <p className="text-sm text-[#90a4cb]">
                  {texts.subtitle}
                </p>
              </div>
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              placeholder={texts.placeholder}
              className="w-full bg-[#0f1623] border border-[#314368] rounded-xl px-4 py-3 text-white placeholder-[#4d5d7e] focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none"
              autoFocus
              maxLength={20}
              onKeyPress={(e) => {
                if (e.key === 'Enter') onSubmit();
              }}
            />
            <div className="flex gap-2">
              <ActionButton
                onClick={onSubmit}
                variant="primary"
                className={!username.trim() ? 'cursor-not-allowed opacity-50' : ''}
              >
                {texts.continue}
              </ActionButton>
              <ActionButton
                onClick={onCancel}
                variant="secondary"
              >
                {texts.cancel}
              </ActionButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
