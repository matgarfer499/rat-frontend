'use client';

import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">{label}</label>
      )}
      <label className="flex flex-col h-12 w-full group">
        <div className="flex w-full flex-1 items-stretch rounded-full bg-surface-light dark:bg-surface-dark shadow-sm ring-1 ring-slate-200 dark:ring-transparent group-focus-within:ring-2 group-focus-within:ring-primary transition-all">
          {icon && (
            <div className="flex items-center justify-center pl-4 text-slate-400 dark:text-slate-500">
              {icon}
            </div>
          )}
          <input
            className={`flex w-full min-w-0 flex-1 bg-transparent px-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none text-base font-normal h-full rounded-xl border-none focus:ring-0 ${className}`}
            {...props}
          />
        </div>
      </label>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
