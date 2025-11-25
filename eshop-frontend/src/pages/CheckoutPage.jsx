import React from 'react';
import CheckoutFeature from '../features/cart_checkout/CheckoutPage';
import { useTranslation } from 'react-i18next';

const CheckoutPage = () => {
  const { t } = useTranslation();

  // هذا المكون يعمل كغلاف (Wrapper) لميزة الدفع
  // يمكننا هنا إضافة أي عناصر مشتركة للصفحة مثل العنوان إذا لزم الأمر
  // ولكن حالياً سنتركه يعرض الميزة مباشرة كما كان
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 sr-only">
        {t('checkout.title') || 'Checkout'}
      </h1>
      <CheckoutFeature />
    </div>
  );
};

export default CheckoutPage;