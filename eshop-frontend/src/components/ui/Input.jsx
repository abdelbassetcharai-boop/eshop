import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

const Input = ({
  label,
  error,
  className = '',
  type = 'text',
  icon: Icon,
  ...props
}) => {
  const baseStyles =
    'w-full px-4 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200';

  const errorStyles = 'border-red-500 focus:border-red-500 focus:ring-red-500/20';
  const iconStyles = Icon ? 'pl-11 rtl:pl-4 rtl:pr-11' : ''; // تعديل الحشوة بناءً على الاتجاه

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
            {Icon}
          </div>
        )}

        <input
          type={type}
          className={twMerge(clsx(baseStyles, iconStyles, error && errorStyles, className))}
          {...props}
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1 animate-fade-in">
          <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;