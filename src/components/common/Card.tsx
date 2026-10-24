/**
 * FarmConnect Glassmorphic Card Container (20px rounded)
 */

import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'glass' | 'solid' | 'gradient' | 'outline';
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  interactive = false,
  className = '',
  onClick,
  ...props
}) => {
  const variantStyles = {
    glass: "bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-[#2E7D32]/15 dark:border-emerald-800/40 text-[#37474F] dark:text-emerald-50 shadow-[0_4px_20px_-2px_rgba(46,125,50,0.07)]",
    solid: "bg-white dark:bg-emerald-950/80 border border-[#2E7D32]/15 dark:border-emerald-800/40 text-[#37474F] dark:text-emerald-50 shadow-[0_4px_16px_rgba(46,125,50,0.06)]",
    gradient: "bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#388E3C] text-white border border-[#66BB6A]/30 shadow-xl shadow-[#1B5E20]/20",
    outline: "border-2 border-[#2E7D32]/20 dark:border-emerald-700/30 bg-[#F7FAF5]/80 dark:bg-emerald-900/10 text-[#37474F] dark:text-emerald-50",
  };

  return (
    <motion.div
      whileHover={interactive ? { y: -4, scale: 1.01 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`rounded-[20px] p-5 relative overflow-hidden transition-all duration-300 ${variantStyles[variant]} ${interactive ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
