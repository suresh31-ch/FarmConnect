/**
 * Reusable Badge / Tag Component
 */

import React from 'react';

export type TagVariant =
  | 'success'
  | 'warning'
  | 'info'
  | 'danger'
  | 'neutral'
  | 'emerald'
  | 'amber'
  | 'blue'
  | 'rose'
  | 'gray'
  | 'sky'
  | 'purple'
  | 'gold'
  | 'outline';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: TagVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  className?: string;
  id?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'emerald',
  size = 'md',
  icon,
  className = '',
  id,
}) => {
  // Map semantic aliases to visual styles
  const resolvedVariant = (() => {
    switch (variant) {
      case 'success':
        return 'emerald';
      case 'warning':
        return 'amber';
      case 'info':
        return 'blue';
      case 'danger':
        return 'rose';
      case 'neutral':
        return 'gray';
      default:
        return variant;
    }
  })();

  const variantStyles: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200 border border-emerald-300/60 dark:border-emerald-700/60",
    amber: "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300/60 dark:border-amber-700/60",
    gold: "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300/60 dark:border-amber-700/60",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-200 border border-blue-300/60 dark:border-blue-700/60",
    sky: "bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-200 border border-sky-300/60 dark:border-sky-700/60",
    rose: "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border border-rose-300/60 dark:border-rose-700/60",
    purple: "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-200 border border-purple-300/60 dark:border-purple-700/60",
    gray: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700",
    outline: "bg-transparent text-slate-700 dark:text-emerald-300 border border-slate-300 dark:border-emerald-700",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] rounded-lg gap-1 font-medium",
    md: "px-2.5 py-1 text-xs rounded-xl gap-1.5 font-semibold",
    lg: "px-3 py-1.5 text-xs rounded-xl gap-2 font-bold",
  };

  return (
    <span
      id={id}
      className={`inline-flex items-center tracking-wide whitespace-nowrap ${variantStyles[resolvedVariant] || variantStyles.emerald} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="material-symbols-rounded text-[14px]">{icon}</span>}
      {children}
    </span>
  );
};

export const Tag = Badge;

