'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ActionButton } from '@components/ui/ActionButton';
import { LockIcon, AlertIcon } from '@components/icons';

interface PasswordModalProps {
  isOpen: boolean;
  password: string;
  error: string;
  loading: boolean;
  onPasswordChange: (password: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  texts: {
    title: string;
    subtitle: string;
    placeholder: string;
    join: string;
    joining: string;
    cancel: string;
  };
}

export function PasswordModal({
  isOpen,
  password,
  error,
  loading,
  onPasswordChange,
  onSubmit,
  onCancel,
  texts,
}: PasswordModalProps) {
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
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <LockIcon size={24} className="text-yellow-500" />
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
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder={texts.placeholder}
              className={`w-full bg-[#0f1623] border rounded-xl px-4 py-3 text-white placeholder-[#4d5d7e] focus:ring-2 outline-none ${
                error
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-[#314368] focus:border-primary focus:ring-primary/50'
              }`}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') onSubmit();
              }}
            />
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertIcon size={16} />
                <span>{error}</span>
              </div>
            )}
            <div className="flex gap-2">
              <ActionButton
                onClick={onSubmit}
                variant="primary"
                className={loading ? 'cursor-not-allowed opacity-75' : ''}
              >
                {loading ? texts.joining : texts.join}
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
