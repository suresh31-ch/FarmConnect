/**
 * Reusable Material Symbols / Lucide Icon Wrapper
 */

import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  size?: number | string;
  filled?: boolean;
  color?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const Icon: React.FC<IconProps> = ({
  name,
  className = '',
  size = 24,
  filled = false,
  color,
  onClick,
}) => {
  const style: React.CSSProperties = {
    fontSize: typeof size === 'number' ? `${size}px` : size,
    fontVariationSettings: filled ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
    color: color,
  };

  return (
    <span
      className={`material-symbols-rounded select-none inline-flex items-center justify-center align-middle ${className}`}
      style={style}
      onClick={onClick}
    >
      {name}
    </span>
  );
};
