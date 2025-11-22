import React from 'react';
// تم تعديل مسار الاستيراد لضمان التوافق: يجب أن يكون المسار الصحيح من components هو ../context
import { useSystem } from '../context/SystemContext';

/**
 * مكون التحميل (Loading Spinner)
 * يُعرض في وضعية التحميل الأولي للتطبيق (Bootstrap) أو أثناء عمليات API طويلة.
 */
const LoadingSpinner = () => {
  // استخدام التدمير (Destructuring) لـ theme لضمان سلامة الكود
  const { theme } = useSystem();

  // الحصول على اللون الأساسي من الثيم، مع قيمة افتراضية
  const primaryColor = theme?.['--primary-color'] || '#059669';

  return (
    // خلفية شفافة تغطي الشاشة بالكامل لتعطي شعوراً بالتركيز
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 bg-opacity-70 dark:bg-opacity-80 flex justify-center items-center z-50 transition-opacity duration-300">
      <div
        className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4"
        // تطبيق اللون الأساسي من الثيم
        style={{ borderColor: primaryColor }}
      >
        <span className="sr-only">جاري تحميل البيانات...</span>
      </div>
      <p className="absolute mt-28 text-lg text-gray-700 dark:text-gray-300 font-medium">
        جاري تحميل المتجر...
      </p>
    </div>
  );
};

export default LoadingSpinner;