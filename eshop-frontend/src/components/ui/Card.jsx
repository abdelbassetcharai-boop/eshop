import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white shadow-lg rounded-lg p-6 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:bg-gradient-to-br from-white to-gray-50 ${className}`}>
      {children}
    </div>
  );
};

export default Card;