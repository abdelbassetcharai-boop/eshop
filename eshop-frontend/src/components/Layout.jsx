import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';

const Layout = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <div
      className={`min-h-screen flex flex-col bg-gray-50 dark:bg-dark-bg transition-colors duration-300 font-sans ${isRTL ? 'rtl' : 'ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Header />

      {/* pt-24: إضافة مساحة علوية لأن الهيدر fixed
        min-h-[80vh]: لضمان أن المحتوى يأخذ مساحة كافية
      */}
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 w-full max-w-[1920px] mx-auto">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;