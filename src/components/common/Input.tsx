/**
 * FarmConnect Reusable Input Component
 */

import React, { useState } from 'react';
import { Icon } from './Icon';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
  helperText?: string;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  icon,
  error,
  helperText,
  isPassword = false,
  className = '',
  type = 'text',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-200 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-slate-400 dark:text-emerald-500/70 pointer-events-none">
            <Icon name={icon} size={20} />
          </span>
        )}
        <input
          type={inputType}
          className={`w-full py-3 text-sm transition-all duration-200 rounded-2xl border bg-white/90 dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-100 placeholder-slate-400 dark:placeholder-emerald-600/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
            icon ? 'pl-11' : 'pl-4'
          } ${isPassword ? 'pr-11' : 'pr-4'} ${
            error
              ? 'border-red-500/80 focus:ring-red-500/40'
              : 'border-slate-200 dark:border-emerald-800/60 hover:border-emerald-400 dark:hover:border-emerald-600'
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-slate-400 dark:text-emerald-500/70 hover:text-emerald-700 dark:hover:text-emerald-300 focus:outline-none"
          >
            <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={20} />
          </button>
        )}
      </div>
      {error && <p className="text-xs font-medium text-red-500 pl-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500 dark:text-emerald-400/70 pl-1">{helperText}</p>}
    </div>
  );
};
