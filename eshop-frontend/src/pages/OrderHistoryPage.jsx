import React from 'react';
import { useTranslation } from 'react-i18next';
import OrderHistoryFeature from '../features/cart_checkout/OrderHistoryPage';

const OrderHistoryPage = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 sr-only">
        {t('nav.orders') || 'Order History'}
      </h1>
      <OrderHistoryFeature />
    </div>
  );
};

export default OrderHistoryPage;