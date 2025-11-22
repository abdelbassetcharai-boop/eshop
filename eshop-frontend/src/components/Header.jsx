import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // المسار الصحيح
import { useSystem } from '../context/SystemContext'; // المسار الصحيح

// ==========================================================
// أيقونات SVG المضمنة (لتجنب أخطاء مكتبات react-icons)
// ==========================================================

const IconSearch = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.385l3.396 3.396a.75.75 0 01-1.06 1.06l-3.396-3.396A7 7 0 012 9z" clipRule="evenodd" />
  </svg>
);

const IconShoppingCart = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M1 1.75A.75.75 0 011.75 1h1.628a1.75 1.75 0 011.734 1.51L5.81 8.25H18.25a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75H6.612L5.438 17.584A1.75 1.75 0 013.628 19H2.75a.75.75 0 010-1.5h.878a.25.25 0 00.244-.214L5.16 9.75H18.25a.25.25 0 00.244-.214L18.84 8.25a.75.75 0 00-.734-.99H5.81L5.112 3.26A.25.25 0 004.866 3H1.75A.75.75 0 011 2.25v-.5zm15.75 9.75a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75H6.612L5.438 17.584A1.75 1.75 0 013.628 19H2.75a.75.75 0 010-1.5h.878a.25.25 0 00.244-.214L5.16 9.75H18.25a.25.25 0 00.244-.214L18.84 8.25a.75.75 0 00-.734-.99H5.81L5.112 3.26A.25.25 0 004.866 3H1.75A.75.75 0 011 2.25v-.5zm15.75 9.75a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75H6.612L5.438 17.584A1.75 1.75 0 013.628 19H2.75a.75.75 0 010-1.5h.878a.25.25 0 00.244-.214L5.16 9.75H18.25a.25.25 0 00.244-.214L18.84 8.25a.75.75 0 00-.734-.99H5.81L5.112 3.26A.25.25 0 004.866 3H1.75A.75.75 0 011 2.25v-.5z" />
  </svg>
);

const IconUserCircle = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM9.5 15a4.5 4.5 0 005.5-4.5h-11a4.5 4.5 0 005.5 4.5z" clipRule="evenodd" />
  </svg>
);

const IconLightMode = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zm.75 15.75a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zm8.125-8.25a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zm-15.75 0a.75.75 0 000-1.5H2.75a.75.75 0 000 1.5h1.5zM15.15 4.85a.75.75 0 010 1.06L14.09 7.06a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zm-10.3 10.3a.75.75 0 010-1.06l1.06-1.06a.75.75 0 011.06 1.06l-1.06 1.06a.75.75 0 01-1.06 0zM17.06 14.09a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 011.06-1.06l1.06 1.06zM6.91 5.91a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM10 6a4 4 0 100 8 4 4 0 000-8z" />
  </svg>
);

const IconDarkMode = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9.5 2A7.5 7.5 0 003 9.5a7.5 7.5 0 007.5 7.5c.676 0 1.341-.116 1.98-.344a.75.75 0 00.103-1.428A5.75 5.75 0 0112 10a5.75 5.75 0 01-5.75-5.75c0-.986.195-1.93.548-2.825a.75.75 0 00-1.428-.103A7.502 7.502 0 009.5 2z" clipRule="evenodd" />
  </svg>
);
// ==========================================================


/**
 * مكون رأس الصفحة (Header)
 * يعرض التنقل، حالة المصادقة، وشعار المتجر بشكل ديناميكي.
 */
const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  // ملاحظة: تم تغيير الاسم من translations إلى t (ترجمة) لتسهيل القراءة
  const { translations: t, config } = useSystem();

  // ==========================================================
  // منطق تبديل الوضع (Light/Dark Mode)
  // ==========================================================
  const isDarkMode = document.documentElement.classList.contains('dark');

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-xl sticky top-0 z-20 transition duration-300">
      <nav className="container mx-auto max-w-7xl p-4 flex justify-between items-center" style={{ direction: 'rtl' }}>

        {/* 1. الشعار واسم المتجر (ديناميكي) */}
        <NavLink to="/" className="text-3xl font-extrabold transition duration-300 hover:opacity-90" style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}>
          {config.site_name || 'متجر رقمي'}
        </NavLink>

        {/* 2. الروابط الأساسية والميزات */}
        <div className="flex items-center space-x-6 space-x-reverse">
          <NavLink to="/" className="text-gray-700 dark:text-gray-300 hover:text-[var(--primary-color)] transition font-medium">
            {t.nav_home || 'الرئيسية'}
          </NavLink>
          <NavLink to="/shop" className="text-gray-700 dark:text-gray-300 hover:text-[var(--primary-color)] transition font-medium">
            المنتجات
          </NavLink>

          {/* أيقونة البحث */}
          <button className="text-gray-600 dark:text-gray-400 hover:text-[var(--primary-color)] transition p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <IconSearch className="w-5 h-5" />
          </button>

          {/* أيقونة السلة */}
          <NavLink to="/cart" className="text-gray-600 dark:text-gray-400 hover:text-[var(--primary-color)] transition p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative">
            <IconShoppingCart className="w-5 h-5" />
            {/* مؤشر عدد العناصر (Hardcoded for demo) */}
            <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold px-1 rounded-full">3</span>
          </NavLink>
        </div>

        {/* 3. المصادقة والأدوات */}
        <div className="flex items-center space-x-4 space-x-reverse">

          {/* زر تبديل الوضع (Light/Dark Mode) */}
          <button
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-400 hover:text-[var(--primary-color)] transition p-2 rounded-full bg-gray-100 dark:bg-gray-700"
            title={isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
          >
            {isDarkMode ? <IconLightMode className="w-5 h-5" /> : <IconDarkMode className="w-5 h-5" />}
          </button>

          {/* حالة المصادقة */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-4 space-x-reverse">
              <NavLink to="/profile" className="font-medium text-gray-800 dark:text-gray-200 hover:text-[var(--primary-color)] transition flex items-center space-x-1 space-x-reverse">
                <IconUserCircle className="w-5 h-5" />
                <span>أهلاً، {user?.name.split(' ')[0]}</span>
              </NavLink>

              {/* رابط لوحة التحكم (مشروط بالدور) */}
              {(user?.role === 'admin' || user?.role === 'vendor') && (
                <NavLink
                  to="/admin/dashboard"
                  className="text-white font-semibold py-2 px-3 rounded-lg transition text-sm shadow-md hover:opacity-90"
                  // لون مختلف للمشرف لتمييزه
                  style={{ backgroundColor: user.role === 'admin' ? '#CC0000' : 'var(--secondary-color)' }}
                >
                  لوحة التحكم
                </NavLink>
              )}

              <button onClick={logout} className="text-red-500 hover:text-red-700 transition duration-150 p-2 text-sm rounded-lg border border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900">
                تسجيل خروج
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="text-white px-5 py-2 rounded-xl font-semibold shadow-lg hover:opacity-90 transition duration-150 text-sm"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              {t.btn_login || 'تسجيل الدخول'}
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;