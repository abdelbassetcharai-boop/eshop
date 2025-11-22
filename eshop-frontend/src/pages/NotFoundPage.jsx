import React from 'react';
import { NavLink } from 'react-router-dom';
// تم تصحيح المسار: من pages/ إلى components/ui/
import Button from '../components/ui/Button';
// تم تصحيح المسار: من pages/ إلى context/
import { useSystem } from '../context/SystemContext';

// أيقونة SVG المضمنة (علامة تعجب كبيرة)
const IconExclamation = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8.485 2.485a.75.75 0 011.03 0l6.75 6.75a.75.75 0 010 1.06l-6.75 6.75a.75.75 0 01-1.06 0l-6.75-6.75a.75.75 0 010-1.06l6.75-6.75zM10 3.75l-6 6 6 6 6-6-6-6z" clipRule="evenodd" />
  </svg>
);


/**
 * مكون صفحة الخطأ 404 (Not Found Page)
 */
const NotFoundPage = () => {
  const { config } = useSystem();

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8"
      style={{ fontFamily: 'var(--font-family)' }}
    >
      <IconExclamation
        className="w-24 h-24 mb-6 text-red-500 dark:text-red-400 transform rotate-12 transition duration-500 hover:rotate-0"
      />

      <h1 className="text-8xl font-extrabold text-gray-900 dark:text-gray-100 mb-4" style={{ color: 'var(--secondary-color)' }}>
        404
      </h1>

      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        عفواً، الصفحة غير موجودة!
      </h2>

      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        يبدو أنك وصلت إلى مسار خاطئ. يرجى التحقق من الرابط أو العودة إلى الصفحة الرئيسية للمتجر.
      </p>

      <NavLink to="/">
        <Button variant="primary" className="text-lg py-3 shadow-xl">
          العودة للصفحة الرئيسية
        </Button>
      </NavLink>

    </div>
  );
};

export default NotFoundPage;