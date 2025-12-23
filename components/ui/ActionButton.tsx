'use client';

import { ReactNode } from 'react';

interface ActionButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ActionButton({ 
  onClick, 
  variant = 'primary', 
  icon, 
  children,
  className = '' 
}: ActionButtonProps) {
  const variantStyles = {
    primary: 'bg-primary shadow-[0_0_20px_rgba(217,30,65,0.3)] hover:shadow-[0_0_30px_rgba(217,30,65,0.5)]',
    secondary: 'bg-surface-dark border border-white/5 hover:border-white/10',
  };

  const textStyles = {
    primary: 'text-white',
    secondary: 'text-white/90',
  };

  return (
    <button 
      onClick={onClick}
      className={`relative group w-full h-14 rounded-full overflow-hidden transition-all active:scale-[0.98] ${variantStyles[variant]} ${className}`}
    >
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className={`flex items-center justify-center gap-3 font-bold text-lg tracking-wide ${textStyles[variant]}`}>
        {icon}
        <span>{children}</span>
      </div>
    </button>
  );
}
