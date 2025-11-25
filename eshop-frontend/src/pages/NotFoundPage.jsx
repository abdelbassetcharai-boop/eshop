import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';
import { AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">
      <div className="bg-yellow-100 dark:bg-yellow-900/20 p-6 rounded-full mb-6">
        <AlertTriangle className="h-16 w-16 text-yellow-500" />
      </div>

      <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white mb-2">404</h1>

      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
        {t('common.page_not_found') || 'Page Not Found'}
      </h2>

      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
        {t('common.page_not_found_desc') || 'Sorry, the page you are looking for might have been removed, had its name changed, or is temporarily unavailable.'}
      </p>

      <Link to="/">
        <Button size="lg" variant="primary" className="shadow-lg shadow-primary-500/20">
          {t('nav.home')}
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;