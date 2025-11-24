import React from 'react';

const Select = ({ label, options = [], error, className = '', ...props }) => {
  return (
    <div className="w-full transform transition-all duration-300">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1 transform transition-all duration-200 hover:scale-105">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white
          transform transition-all duration-300 hover:scale-[1.02] hover:shadow-md
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600 animate-pulse">{error}</p>}
    </div>
  );
};

export default Select;