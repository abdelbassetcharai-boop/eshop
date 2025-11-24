import React from 'react';

const Spinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-b-2 border-t-2 border-indigo-600 ${sizes[size]} transform transition-all duration-500 hover:scale-125 hover:border-pink-500`}></div>
    </div>
  );
};

export default Spinner;