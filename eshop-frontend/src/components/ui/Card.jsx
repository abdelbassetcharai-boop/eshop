import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

const Card = ({ children, className = '', noPadding = false, ...props }) => {
  const baseStyles = 'bg-white dark:bg-dark-card shadow-sm rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300';
  const paddingStyles = noPadding ? '' : 'p-6';

  return (
    <div className={twMerge(clsx(baseStyles, paddingStyles, className))} {...props}>
      {children}
    </div>
  );
};

export default Card;