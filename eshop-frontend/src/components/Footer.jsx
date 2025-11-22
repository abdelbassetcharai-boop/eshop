import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSystem } from '../context/SystemContext';

/**
 * مكون تذييل الصفحة (Footer)
 * يعرض معلومات حقوق النشر والروابط السريعة بشكل ديناميكي.
 */
const Footer = () => {
  // ملاحظة: تم تغيير الاسم من translations إلى t (ترجمة) لتسهيل القراءة
  const { config, translations: t } = useSystem();

  // الحصول على العام الحالي لـ حقوق النشر
  const currentYear = new Date().getFullYear();

  // الحصول على اللون الأساسي للروابط في التذييل
  const primaryColor = config.site_name ? 'var(--primary-color)' : '#059669';

  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white p-8 mt-12 shadow-inner border-t border-gray-700/50" style={{ fontFamily: 'var(--font-family, Cairo, sans-serif)' }}>
      <div className="container mx-auto max-w-7xl" style={{ direction: 'rtl' }}>

        {/* 1. القسم العلوي: الشعار والروابط السريعة */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-gray-700/50">

          {/* العمود 1: الشعار والوصف */}
          <div>
            <NavLink to="/" className="text-3xl font-extrabold transition duration-300 hover:opacity-90" style={{ color: primaryColor }}>
              {config.site_name || 'المتجر العالمي'}
            </NavLink>
            <p className="mt-4 text-gray-400 text-sm">
              منصة للتجارة الإلكترونية بمعمارية ديناميكية قابلة للتخصيص بالكامل.
            </p>
          </div>

          {/* العمود 2: المتجر */}
          <div>
            <h5 className="text-lg font-semibold mb-4 text-white">المتجر</h5>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><NavLink to="/shop" className="hover:text-white transition">المنتجات</NavLink></li>
              <li><NavLink to="/categories" className="hover:text-white transition">الفئات</NavLink></li>
              <li><NavLink to="/flash-sales" className="hover:text-white transition">العروض المؤقتة</NavLink></li>
            </ul>
          </div>

          {/* العمود 3: الدعم والمساعدة */}
          <div>
            <h5 className="text-lg font-semibold mb-4 text-white">الدعم</h5>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><NavLink to="/profile" className="hover:text-white transition">الملف الشخصي</NavLink></li>
              <li><NavLink to="/orders" className="hover:text-white transition">طلباتي</NavLink></li>
              <li><NavLink to="/faq" className="hover:text-white transition">الأسئلة الشائعة</NavLink></li>
              <li><NavLink to="/contact" className="hover:text-white transition">اتصل بنا</NavLink></li>
            </ul>
          </div>

          {/* العمود 4: معلومات قانونية */}
          <div>
            <h5 className="text-lg font-semibold mb-4 text-white">معلومات</h5>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><NavLink to="/privacy" className="hover:text-white transition">سياسة الخصوصية</NavLink></li>
              <li><NavLink to="/terms" className="hover:text-white transition">الشروط والأحكام</NavLink></li>
              <li><NavLink to="/shipping-info" className="hover:text-white transition">معلومات الشحن</NavLink></li>
            </ul>
          </div>
        </div>

        {/* 2. القسم السفلي: حقوق النشر */}
        <div className="pt-4 text-center text-gray-400 text-sm">
          &copy; {currentYear} {config.site_name || 'My Global Store'}. {t.footer_rights || 'جميع الحقوق محفوظة.'}
          <p className="mt-1 text-xs">
            Powered by Dynamic CMS Architecture
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;