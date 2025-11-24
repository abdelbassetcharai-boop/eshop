import React from 'react';
import Button from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-6 transform transition-all duration-500">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="transform transition-all duration-300 hover:scale-110 active:scale-95"
      >
        <ChevronLeft className="h-4 w-4 animate-pulse" />
      </Button>

      <span className="text-sm text-gray-700 transform transition-all duration-300 hover:scale-125 font-bold">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="transform transition-all duration-300 hover:scale-110 active:scale-95"
      >
        <ChevronRight className="h-4 w-4 animate-pulse" />
      </Button>
    </div>
  );
};

export default Pagination;