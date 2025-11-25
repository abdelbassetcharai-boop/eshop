import React from 'react';
import Button from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mt-8 animate-fade-in">
      <Button
        variant="secondary"
        size="icon"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
        aria-label={t('common.previous_page') || 'Previous Page'}
      >
        {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      <span className="px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('common.page', { current: currentPage, total: totalPages }) || `Page ${currentPage} of ${totalPages}`}
      </span>

      <Button
        variant="secondary"
        size="icon"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
        aria-label={t('common.next_page') || 'Next Page'}
      >
        {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default Pagination;