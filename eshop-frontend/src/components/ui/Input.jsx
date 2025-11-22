import React from 'react';
import { useSystem } from '../../context/SystemContext'; // لضمان استخدام الخط والألوان الديناميكية

/**
 * مكون Input مخصص (Custom Input)
 * يدعم حالات الخطأ (Error States) والتحكم الديناميكي في التصميم.
 * * @param {string} label - التسمية التي تظهر فوق الحقل.
 * @param {string} type - نوع الإدخال (text, email, password, number).
 * @param {string} placeholder - النص المساعد داخل الحقل.
 * @param {string} value - قيمة الحقل.
 * @param {function} onChange - دالة التغيير.
 * @param {string} error - رسالة الخطأ المراد عرضها.
 * @param {object} props - خصائص HTML إضافية.
 */
const Input = ({ label, type = 'text', placeholder, value, onChange, error, ...props }) => {
  // يتم الحصول على بيانات الثيم من السياق (SystemContext)
  // لا يمكن الوصول لـ useSystem() إلا إذا تم تغليف المكون بـ SystemProvider
  // ولتجنب خطأ التجميع المؤقت، نقوم بالتحقق أو استخدام قيمة افتراضية.
  // في هذا السياق، سنستخدم استيراد صحيح.

  // يجب أن يكون المسار الصحيح هو:
  // من components/ui/
  // إلى context/
  // لذلك: ../../context/SystemContext
  const { theme } = useSystem();

  // بناء كلاسات Tailwind بناءً على حالة الخطأ والألوان الديناميكية
  const baseClasses = `
    w-full px-4 py-3 border rounded-xl transition shadow-sm
    text-gray-800 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600
    focus:outline-none focus:ring-2
  `;

  // تحديد كلاسات الحدود والتركيز
  const borderClass = error
    ? 'border-red-500'
    : 'border-gray-300 dark:border-gray-600';

  const focusClass = error
    ? 'focus:ring-red-500' // لون أحمر إذا كان هناك خطأ
    : 'focus:ring-[var(--primary-color)]'; // اللون الرئيسي من الثيم

  return (
    <div className="mb-4" style={{ direction: 'rtl', fontFamily: 'var(--font-family, Cairo, sans-serif)' }}>
      {label && (
        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${baseClasses} ${borderClass} ${focusClass}`}
        // يجب أن يتم الوصول إلى الثيم بهذا الشكل
        style={{ borderRadius: theme?.['--border-radius'] || '0.75rem' }}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;