import React from 'react';
import { Outlet } from 'react-router-dom';
// المسار الصحيح: من src/components/ إلى src/context/
import { useSystem } from '../context/SystemContext';
// المسارات الصحيحة (تفترض وجود الملفات في نفس مجلد components)
import Header from './Header';
import Footer from './Footer';

/**
 * مكون التخطيط (Layout) الرئيسي
 * يغلف جميع الصفحات لتوفير هيكل موحد (Header + Footer).
 */
const Layout = () => {
  const { isLoaded } = useSystem();

  // نضمن تحميل إعدادات النظام قبل العرض
  if (!isLoaded) {
    // هذا سيعتمد على LoadingSpinner الذي يتم عرضه في App.jsx
    return null;
  }

  return (
    // تطبيق الخط من الـ Backend على مستوى الجذر
    <div
      className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
      style={{ fontFamily: 'var(--font-family, Cairo, sans-serif)' }}
    >
      {/* رأس الصفحة (Header.jsx) */}
      <Header />

      {/* محتوى الصفحة الحالي (يتم حقنه بواسطة React Router) */}
      <main className="flex-grow container mx-auto p-4 max-w-7xl transition-opacity duration-500">
        <Outlet />
      </main>

      {/* تذييل الصفحة (Footer.jsx) */}
      <Footer />
    </div>
  );
};

export default Layout;