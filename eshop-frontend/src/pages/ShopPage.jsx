import React from 'react';
// تم تصحيح المسار: من pages/ إلى features/products/
import ProductList from '../features/products/ProductList';
// تم تصحيح المسار: من pages/ إلى context/
import { useSystem } from '../context/SystemContext';

/**
 * مكون صفحة المنتجات (Shop Page)
 * هذه هي الواجهة الرئيسية لعرض جميع المنتجات المتاحة.
 */
const ShopPage = () => {
  const { config } = useSystem();

  return (
    <div style={{ direction: 'rtl', fontFamily: 'var(--font-family)' }} className="mt-6">

      {/* العنوان الرئيسي */}
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-8" style={{ color: 'var(--primary-color)' }}>
        جميع المنتجات المتاحة
      </h1>

      {/* مكون قائمة المنتجات (يتضمن منطق الجلب والتصفية) */}
      <ProductList />

    </div>
  );
};

export default ShopPage;