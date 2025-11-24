import React from 'react';

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 transform transition-all duration-300 hover:scale-110',
    success: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 transform transition-all duration-300 hover:scale-110',
    warning: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 transform transition-all duration-300 hover:scale-110',
    danger: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 transform transition-all duration-300 hover:scale-110',
    info: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 transform transition-all duration-300 hover:scale-110',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium animate-pulse ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
};

export default Badge;