import React from 'react';
import { useSystem } from '../../context/SystemContext'; // لجلب الثيم
import { IoIosRefresh } from 'react-icons/io'; // أيقونة التحميل (افتراضية)

/**
 * مكون Button مخصص (Custom Button)
 * يدعم أنواع الأزرار (Primary, Secondary, Outline, Ghost) وحالات التحميل.
 * * @param {string} variant - نوع الزر ('primary', 'secondary', 'outline', 'ghost').
 * @param {boolean} isLoading - حالة التحميل.
 * @param {string} children - محتوى الزر.
 * @param {object} props - خصائص HTML إضافية.
 */
const Button = ({
  variant = 'primary',
  isLoading = false,
  children,
  className = '',
  ...props
}) => {
  const { theme } = useSystem();

  // ==========================================================
  // 1. تحديد كلاسات الثيم بناءً على النوع (Variant)
  // ==========================================================
  let baseClasses = `
    font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-md
    focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed
    text-center whitespace-nowrap flex items-center justify-center space-x-2 space-x-reverse
  `;

  // الحصول على قيم الألوان الديناميكية
  const primaryColor = theme?.['--primary-color'] || '#059669';
  const secondaryColor = theme?.['--secondary-color'] || '#3B82F6';
  const borderRadius = theme?.['--border-radius'] || '0.75rem';

  // تطبيق كلاسات لكل نوع
  switch (variant) {
    case 'secondary':
      baseClasses += ` bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600`;
      break;
    case 'outline':
      // استخدام القيمة الفعلية للمتغير في Tailwind
      baseClasses += ` border border-[${primaryColor}] text-[${primaryColor}] bg-white hover:bg-green-50 shadow-sm focus:ring-[${primaryColor}] dark:bg-transparent dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-700`;
      break;
    case 'ghost':
      baseClasses += ` text-gray-600 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 shadow-none focus:ring-gray-300`;
      break;
    case 'primary':
    default:
      // استخدام القيمة الفعلية للمتغير في Tailwind
      baseClasses += ` bg-[${primaryColor}] text-white hover:bg-opacity-90 focus:ring-[${primaryColor}] shadow-lg`;
      break;
  }

  // دمج الكلاسات المخصصة من Props
  const finalClasses = `${baseClasses} ${className}`;

  return (
    <button
      className={finalClasses}
      disabled={isLoading || props.disabled}
      style={{ borderRadius: borderRadius }}
      {...props}
    >
      {/* عرض أيقونة التحميل إذا كان الزر في حالة تحميل */}
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            // التأكد من أن لون سبينر التحميل يتغير بناءً على نوع الزر
            style={{ color: variant === 'primary' ? 'white' : primaryColor }}
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>جاري التحميل...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;