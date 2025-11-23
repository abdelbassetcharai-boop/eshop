import React from 'react';
import Spinner from './ui/Spinner'; // إعادة استخدام مكون Spinner الموجود في ui

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <Spinner size="lg" />
    </div>
  );
};

export default LoadingSpinner;