import React from 'react';

export const Table = ({ children }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 transform transition-all duration-300">
      {children}
    </table>
  </div>
);

export const TableHead = ({ children }) => (
  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
    <tr className="transform transition-all duration-300 hover:shadow-md">{children}</tr>
  </thead>
);

export const TableBody = ({ children }) => (
  <tbody className="bg-white divide-y divide-gray-200">
    {children}
  </tbody>
);

export const TableRow = ({ children }) => (
  <tr className="transform transition-all duration-200 hover:scale-[1.01] hover:shadow-lg hover:bg-gray-50 cursor-pointer">
    {children}
  </tr>
);

export const TableHeader = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider transform transition-all duration-200 hover:scale-105">
    {children}
  </th>
);

export const TableCell = ({ children }) => (
  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 transform transition-all duration-200 hover:scale-105">
    {children}
  </td>
);