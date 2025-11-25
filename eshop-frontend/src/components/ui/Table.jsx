import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

export const Table = ({ children, className }) => (
  <div className="relative overflow-x-auto shadow-md sm:rounded-lg border border-gray-200 dark:border-gray-700">
    <table className={twMerge(clsx("w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400", className))}>
      {children}
    </table>
  </div>
);

export const TableHead = ({ children, className }) => (
  <thead className={twMerge(clsx("text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400", className))}>
    <tr>{children}</tr>
  </thead>
);

export const TableBody = ({ children, className }) => (
  <tbody className={twMerge(clsx("divide-y divide-gray-200 dark:divide-gray-700", className))}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className, ...props }) => (
  <tr
    className={twMerge(clsx("bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200", className))}
    {...props}
  >
    {children}
  </tr>
);

export const TableHeader = ({ children, className }) => (
  <th scope="col" className={twMerge(clsx("px-6 py-3 font-medium whitespace-nowrap", className))}>
    {children}
  </th>
);

export const TableCell = ({ children, className }) => (
  <td className={twMerge(clsx("px-6 py-4", className))}>
    {children}
  </td>
);