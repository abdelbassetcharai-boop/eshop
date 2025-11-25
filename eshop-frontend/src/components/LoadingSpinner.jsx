import React from 'react';
import Spinner from './ui/Spinner';

const LoadingSpinner = ({ fullScreen = true }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-dark-bg/80 backdrop-blur-sm transition-colors duration-300">
        <Spinner size="lg" variant="primary" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-8 w-full h-full">
      <Spinner size="md" variant="primary" />
    </div>
  );
};

export default LoadingSpinner;