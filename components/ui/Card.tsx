import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'solid';
  glowColor?: 'purple' | 'cyan' | 'yellow' | 'none';
  hoverable?: boolean;
}

export function Card({
  children,
  className = '',
  variant = 'default',
  glowColor = 'none',
  hoverable = false,
}: CardProps) {
  const baseStyles = 'rounded-2xl transition-all duration-300';

  const variantStyles = {
    default: 'bg-purple-dark/50 border border-purple-base/30 backdrop-blur-sm',
    glass: 'bg-white/5 border border-white/10 backdrop-blur-md',
    solid: 'bg-purple-base/20 border border-purple-base/40',
  };

  const glowStyles = {
    none: '',
    purple: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    cyan: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    yellow: 'shadow-[0_0_20px_rgba(250,204,21,0.3)]',
  };

  const hoverStyles = hoverable
    ? 'hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:border-purple-light/50 cursor-pointer active:scale-[0.98]'
    : '';

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${glowStyles[glowColor]} ${hoverStyles} ${className}`.trim();

  return <div className={combinedClassName}>{children}</div>;
}
