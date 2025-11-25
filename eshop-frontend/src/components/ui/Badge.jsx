import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

const Badge = ({ children, variant = 'default', className }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const variants = {
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400',
  };

  const baseStyles = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200 ${
    isRTL ? 'font-cairo' : 'font-inter'
  }`;

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], className))}>
      {children}
    </span>
  );
};

export default Badge;