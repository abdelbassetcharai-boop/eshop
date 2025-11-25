import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

const Spinner = ({ size = 'md', variant = 'primary', className }) => {
  const { t } = useTranslation();

  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4',
  };

  const variants = {
    primary: 'border-primary-500 border-t-transparent dark:border-primary-400 dark:border-t-transparent',
    white: 'border-white border-t-transparent',
    secondary: 'border-secondary-500 border-t-transparent',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'animate-spin rounded-full inline-block',
          sizes[size],
          variants[variant],
          className
        )
      )}
      role="status"
      aria-label={t('common.loading')}
    >
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  );
};

export default Spinner;