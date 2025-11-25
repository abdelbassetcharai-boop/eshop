import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  isLoading = false,
  disabled,
  type = 'button',
  ...props
}) => {
  const { t } = useTranslation();

  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95';

  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50',
    secondary: 'bg-white dark:bg-dark-card text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 shadow-lg shadow-red-500/30',
    ghost: 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50',
    link: 'text-primary-600 underline-offset-4 hover:underline p-0 height-auto',
    gradient: 'bg-gradient-to-r from-secondary-500 to-orange-600 text-white hover:opacity-90 shadow-lg shadow-orange-500/30'
  };

  const sizes = {
    sm: 'h-9 px-3 text-xs rounded-lg',
    md: 'h-11 px-6 text-sm',
    lg: 'h-14 px-8 text-base rounded-2xl',
    icon: 'h-10 w-10 p-2'
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      type={type}
      disabled={isLoading || disabled}
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mx-2 h-4 w-4 animate-spin" />
          <span>{t('common.loading')}</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;