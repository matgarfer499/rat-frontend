import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
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
  const baseStyles = 'rounded-lg font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantStyles = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg',
    secondary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg',
    ghost: 'border-2 border-gray-300 hover:bg-gray-50 text-gray-700',
  }
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-6 py-4 text-xl',
  }
  
  const widthStyle = fullWidth ? 'w-full' : ''
  
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`.trim()
  
  return (
    <button className={combinedClassName} disabled={disabled} {...props}>
      {children}
    </button>
  )
}
