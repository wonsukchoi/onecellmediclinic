import React from 'react';
import { iconPaths, type IconName } from './iconPaths';
import styles from './Icon.module.css';

export interface IconProps {
  name: IconName;
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
  title?: string;
  onClick?: () => void;
}

const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color,
  className,
  title,
  onClick
}) => {
  const getSizeValue = (size: IconProps['size']): number => {
    if (typeof size === 'number') return size;

    switch (size) {
      case 'sm': return 16;
      case 'md': return 20;
      case 'lg': return 24;
      case 'xl': return 32;
      default: return 20;
    }
  };

  const sizeValue = getSizeValue(size);
  const path = iconPaths[name];

  if (!path) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  const combinedClassName = [
    styles.icon,
    onClick ? styles.clickable : '',
    className || ''
  ].filter(Boolean).join(' ');

  return (
    <svg
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={combinedClassName}
      onClick={onClick}
      role={onClick ? 'button' : 'img'}
      aria-label={title || name}
    >
      {title && <title>{title}</title>}
      <path d={path} fill={color || 'currentColor'} stroke="none" />
    </svg>
  );
};

export default Icon;