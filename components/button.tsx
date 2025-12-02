import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'neon'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  children: ReactNode
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles = 'rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide'
  
  const variantStyles = {
    primary: 'bg-purple-base hover:bg-purple-light text-white shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]',
    secondary: 'bg-cyan-accent hover:bg-cyan-glow text-white shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg',
    ghost: 'border-2 border-purple-base/50 hover:border-purple-light hover:bg-purple-base/20 text-white',
    neon: 'bg-transparent border-2 border-purple-light text-purple-light hover:bg-purple-light hover:text-purple-dark shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)]',
  }
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }
  
  const widthStyle = fullWidth ? 'w-full' : ''
  
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`.trim()
  
  return (
    <button className={combinedClassName} disabled={disabled} {...props}>
      {children}
    </button>
  )
}
