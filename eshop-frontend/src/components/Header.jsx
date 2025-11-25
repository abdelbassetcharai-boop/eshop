import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, LogOut, Menu, X, LayoutDashboard, Store, Search, ChevronDown } from 'lucide-react';
import ThemeToggle from './ui/ThemeToggle';
import LanguageSwitcher from './ui/LanguageSwitcher';
import Button from './ui/Button';

// مكون فرعي للقائمة الجانبية (Mobile Sidebar)
const MobileSidebar = ({ isOpen, onClose, t, isRTL, isAuthenticated, isAdmin, isVendor, handleLogout, pathname }) => {
    // دالة لتحديد فئة الرابط النشط
    const isActive = (path) => pathname === path;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* الخلفية المعتمة - Z-index: 9997 */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9997] md:hidden"
                    />

                    {/* القائمة المنزلقة - Z-index: 9998 */}
                    <motion.div
                        initial={{ x: isRTL ? '100%' : '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: isRTL ? '100%' : '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={`fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} w-[280px] bg-white dark:bg-dark-card shadow-2xl z-[9998] md:hidden flex flex-col`}
                    >
                        {/* محتوى القائمة */}
                        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-4">

                            {/* زر الإغلاق وأزرار اللغة/الثيم (كبديل لرأس القائمة المكرر) */}
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                                <div className='flex gap-2'>
                                    <LanguageSwitcher />
                                    <ThemeToggle />
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            <nav className="space-y-2 pt-4">
                                <Link
                                    to="/"
                                    onClick={onClose}
                                    className={`block px-4 py-3 rounded-xl font-medium transition-colors ${
                                        isActive('/')
                                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' // لون نشط
                                            : 'bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600' // لون غير نشط
                                    }`}
                                >
                                    {t('nav.home')}
                                </Link>
                                <Link
                                    to="/shop"
                                    onClick={onClose}
                                    className={`block px-4 py-3 rounded-xl font-medium transition-colors ${
                                        isActive('/shop')
                                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' // لون نشط
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-600' // لون غير نشط
                                    }`}
                                >
                                    {t('nav.shop')}
                                </Link>

                                {isAuthenticated ? (
                                    <>
                                        <div className="border-t border-gray-100 dark:border-gray-700 my-2 pt-2">
                                            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('nav.profile')}</p>
                                            {isAdmin && (
                                                <Link to="/admin/dashboard" onClick={onClose} className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-primary-600">{t('nav.dashboard')}</Link>
                                            )}
                                            {isVendor && (
                                                <Link to="/vendor/dashboard" onClick={onClose} className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-primary-600">{t('nav.vendor')}</Link>
                                            )}
                                            <Link to="/profile" onClick={onClose} className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-primary-600">{t('nav.profile')}</Link>
                                        </div>
                                        <button
                                            onClick={() => { handleLogout(); onClose(); }}
                                            className="w-full text-left rtl:text-right px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors"
                                        >
                                            {t('nav.logout')}
                                        </button>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <Link to="/login" onClick={onClose}>
                                            <Button variant="ghost" className="w-full justify-center">{t('nav.login')}</Button>
                                        </Link>
                                        <Link to="/register" onClick={onClose}>
                                            <Button variant="primary" className="w-full justify-center">{t('nav.register')}</Button>
                                        </Link>
                                    </div>
                                )}
                            </nav>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};


const Header = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { cartItems } = useCart();
    const { theme } = useTheme();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation(); // 👈 جلب الموقع الحالي

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const isAdmin = user?.role === 'admin';
    const isVendor = user?.role === 'vendor';
    const isRTL = i18n.dir() === 'rtl';
    const currentPath = location.pathname; // 👈 المسار الحالي

    // دالة لتحديد فئة الرابط النشط
    const isActive = (path) => currentPath === path;

    // مراقبة التمرير
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // إغلاق القوائم عند تغيير المسار
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsProfileOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* 1. الهيدر الرئيسي - يتم عرضه فقط عندما تكون القائمة الجانبية مغلقة (الحل لمشكلة التداخل) */}
            {!isMobileMenuOpen && (
                <header
                    // ثبات دائم للمظهر والأولوية
                    className="fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md shadow-sm py-2"
                >
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">

                            {/* الشعار (Logo) */}
                            <Link to="/" className="flex items-center gap-2 group">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-primary-500/50 transition-all duration-300 group-hover:scale-105">
                                    E
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-none tracking-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                        EShop
                                    </h1>
                                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 tracking-widest uppercase">
                                        Premium Store
                                    </span>
                                </div>
                            </Link>

                            {/* 👈 [جديد] روابط التنقل الرئيسية (سطح المكتب فقط) */}
                            <nav className="hidden md:flex items-center mx-6 space-x-6 rtl:space-x-reverse">
                                <Link
                                    to="/"
                                    className={`text-sm font-medium transition-colors ${
                                        isActive('/')
                                            ? 'text-primary-600 dark:text-primary-400' // نشط
                                            : 'text-gray-700 dark:text-gray-300 hover:text-primary-600' // غير نشط
                                    }`}
                                >
                                    {t('nav.home')}
                                </Link>
                                <Link
                                    to="/shop"
                                    className={`text-sm font-medium transition-colors ${
                                        isActive('/shop')
                                            ? 'text-primary-600 dark:text-primary-400' // نشط
                                            : 'text-gray-700 dark:text-gray-300 hover:text-primary-600' // غير نشط
                                    }`}
                                >
                                    {t('nav.shop')}
                                </Link>
                                {/* يمكن إضافة المزيد من الروابط هنا */}
                            </nav>


                            {/* البحث (Desktop) */}
                            <div className="hidden md:flex flex-1 max-w-lg mx-8 relative group">
                                <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder={t('common.search_placeholder')}
                                    className="block w-full pl-10 rtl:pl-4 rtl:pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-full leading-5 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-dark-card focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 sm:text-sm"
                                />
                            </div>

                            {/* أدوات التحكم والقائمة */}
                            <div className="flex items-center gap-2 sm:gap-4">
                                {/* تبديل اللغة والثيم (يختفيان في الموبايل الصغير جداً لتوفير المساحة) */}
                                <div className="hidden sm:flex items-center gap-2">
                                    <LanguageSwitcher />
                                    <ThemeToggle />
                                </div>

                                {/* أيقونة السلة */}
                                <Link to="/cart" className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <ShoppingCart className="h-6 w-6" />
                                    <AnimatePresence>
                                        {cartCount > 0 && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                className="absolute top-0 right-0 rtl:left-0 rtl:right-auto transform translate-x-1/4 -translate-y-1/4 bg-secondary-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm border-2 border-white dark:border-dark-bg"
                                            >
                                                {cartCount}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Link>

                                {/* منطقة المستخدم (Profile / Login) */}
                                {isAuthenticated ? (
                                    <div className="relative ml-2 rtl:mr-2 hidden md:block">
                                        <button
                                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                                            className="flex items-center gap-2 focus:outline-none"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold border border-primary-200 dark:border-primary-800">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* القائمة المنسدلة للملف الشخصي */}
                                        <AnimatePresence>
                                            {isProfileOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    transition={{ duration: 0.1 }}
                                                    className={`absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 bg-white dark:bg-dark-card rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 overflow-hidden z-50 origin-top-right rtl:origin-top-left`}
                                                >
                                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                                                    </div>

                                                    <div className="py-1">
                                                        {isAdmin && (
                                                            <Link to="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400">
                                                                <LayoutDashboard className="w-4 h-4" />
                                                                {t('nav.dashboard')}
                                                            </Link>
                                                        )}
                                                        {isVendor && (
                                                            <Link to="/vendor/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400">
                                                                <Store className="w-4 h-4" />
                                                                {t('nav.vendor')}
                                                            </Link>
                                                        )}
                                                        <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400">
                                                                <User className="w-4 h-4" />
                                                            {t('nav.profile')}
                                                        </Link>
                                                    </div>

                                                    <div className="border-t border-gray-100 dark:border-gray-700 py-1">
                                                        <button
                                                            onClick={handleLogout}
                                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        >
                                                            <LogOut className="w-4 h-4" />
                                                            {t('nav.logout')}
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <div className="hidden md:flex items-center gap-3">
                                        <Link to="/login">
                                            <Button variant="ghost" size="sm">{t('nav.login')}</Button>
                                        </Link>
                                        <Link to="/register">
                                            <Button variant="primary" size="sm" className="shadow-md">{t('nav.register')}</Button>
                                        </Link>
                                    </div>
                                )}

                                {/* زر القائمة (Mobile Menu Toggle) */}
                                <button
                                    onClick={() => setIsMobileMenuOpen(true)}
                                    className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                >
                                    <Menu className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>
            )}

            {/* 2. القائمة الجانبية للموبايل (Mobile Sidebar) */}
            <MobileSidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                t={t}
                isRTL={isRTL}
                isAuthenticated={isAuthenticated}
                isAdmin={isAdmin}
                isVendor={isVendor}
                handleLogout={handleLogout}
                pathname={currentPath} // 👈 تمرير المسار للـ Sidebar
            />
        </>
    );
};

export default Header;