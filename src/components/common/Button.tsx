/**
 * FarmConnect Reusable Button Component
 * Supports green gradients, outline, ghost, large rounded design with motion micro-interactions.
 */

import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { Icon } from './Icon';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-semibold transition-all duration-200 select-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500/40";
  
  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs rounded-xl gap-1.5",
    md: "px-4 py-2.5 text-sm rounded-2xl gap-2",
    lg: "px-6 py-3.5 text-base rounded-[20px] gap-2.5",
    xl: "px-8 py-4 text-lg rounded-[22px] gap-3 font-bold tracking-wide",
  };

  const variantStyles = {
    primary: "bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#388E3C] hover:from-[#144718] hover:to-[#2E7D32] text-white shadow-[#1B5E20]/25 shadow-lg active:scale-[0.98]",
    secondary: "bg-[#2E7D32]/10 text-[#1B5E20] hover:bg-[#2E7D32]/20 dark:bg-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-800/60 active:scale-[0.98]",
    accent: "bg-gradient-to-r from-[#FFB300] to-[#FB8C00] text-slate-950 font-bold hover:from-[#FFA000] hover:to-[#F57C00] shadow-[#FFB300]/30 shadow-md active:scale-[0.98]",
    outline: "border-2 border-[#2E7D32]/40 text-[#1B5E20] dark:text-emerald-300 hover:bg-[#2E7D32]/10 hover:border-[#2E7D32] active:scale-[0.98]",
    ghost: "text-[#37474F] dark:text-slate-200 hover:bg-[#2E7D32]/10 dark:hover:bg-slate-800/50 active:scale-[0.98]",
    danger: "bg-gradient-to-r from-[#D32F2F] to-[#C62828] text-white hover:from-[#B71C1C] hover:to-[#D32F2F] shadow-[#D32F2F]/20 shadow-md active:scale-[0.98]",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.015 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      ) : (
        <>
          {leftIcon && <Icon name={leftIcon} size={size === 'sm' ? 18 : 20} />}
          <span>{children}</span>
          {rightIcon && <Icon name={rightIcon} size={size === 'sm' ? 18 : 20} />}
        </>
      )}
    </motion.button>
  );
};
