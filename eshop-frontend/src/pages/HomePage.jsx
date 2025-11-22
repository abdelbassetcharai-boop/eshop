import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
// تم تصحيح المسار: من pages/ إلى context/
import { useSystem } from '../context/SystemContext';
import { useAuth } from '../context/AuthContext';
// تم تصحيح المسار: من pages/ إلى features/products/
import ProductList from '../features/products/ProductList'; // الملف 19 (مستخدم لعرض المنتجات)
// تم تصحيح المسار: من pages/ إلى components/ui/
import Button from '../components/ui/Button';

// ==========================================================
// مكونات الصفحة الرئيسية الديناميكية (Dynamic Components)
// يتم محاكاتها هنا، وفي التطبيق الفعلي ستكون ملفات Features منفصلة.
// ==========================================================

// 1. مكون عرض البنرات (Hero Slider)
const HeroSlider = ({ props, banners }) => (
    <div className="relative h-96 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden shadow-2xl mb-12">
        <img
            src={banners[0]?.image_url || 'https://placehold.co/1200x400/059669/FFFFFF?text=Main+Banner'}
            alt={banners[0]?.title || 'عرض رئيسي'}
            className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center p-8 text-center">
            <div className="text-white">
                <h2 className="text-5xl font-extrabold mb-4 animate-fadeInUp" style={{ fontFamily: 'var(--font-family)' }}>
                    {banners[0]?.title || 'تسوق أحدث المنتجات بذكاء'}
                </h2>
                <NavLink to="/shop">
                    <Button variant="primary" className="text-lg bg-red-600 border-2 border-white hover:bg-red-700">
                        اكتشف الآن
                    </Button>
                </NavLink>
            </div>
        </div>
    </div>
);

// 2. مكون شريط المميزات (Features Bar)
const FeaturesBar = ({ props }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-12 border border-gray-100 dark:border-gray-700">
        <FeatureItem title="شحن مجاني" description="للطلبات فوق 500 ريال" />
        <FeatureItem title="دعم 24/7" description="محادثة مباشرة وفورية" />
        <FeatureItem title="إرجاع سهل" description="خلال 14 يوماً" />
        <FeatureItem title="دفع آمن" description="حماية كاملة للبيانات" />
    </div>
);

const FeatureItem = ({ title, description }) => (
    <div className="text-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition duration-200">
        <h4 className="font-semibold text-gray-800 dark:text-gray-100">{title}</h4>
        <p className="text-sm text-gray-500">{description}</p>
    </div>
);

// 3. مكون عرض الفلاش سيل (Flash Sale)
const FlashSale = ({ props }) => {
    // منطق العد التنازلي هنا (محاكاة)
    return (
        <div className="bg-red-600 text-white p-8 rounded-xl shadow-2xl mb-12 text-center transform scale-100 hover:scale-[1.01] transition-transform duration-300">
            <h2 className="text-4xl font-extrabold mb-2">عرض سريع - خصم 40%</h2>
            <p className="text-xl font-medium mb-4">ينتهي العرض خلال: 05h : 30m : 15s</p>
            <NavLink to="/shop?sale=flash">
                <Button variant="secondary" className="bg-white text-red-600 hover:bg-gray-200 shadow-lg">تسوق العرض</Button>
            </NavLink>
        </div>
    );
};

// ==========================================================
// الدالة الرئيسية: عرض المكونات بناءً على التخطيط الديناميكي
// ==========================================================

// ربط أنواع الـ Backend بـ مكونات React
const COMPONENT_MAP = {
    HeroSlider: HeroSlider,
    FeaturesBar: FeaturesBar,
    FlashSale: FlashSale,
    ProductGrid: ProductList, // نستخدم ProductList (الملف 19) لعرض المنتجات
};

const HomePage = () => {
    const { config, layout, banners } = useSystem();
    const { isAuthenticated } = useAuth();

    // إجمالي المكونات التي سيتم عرضها (يجب أن تكون مرتبة حسب 'order')
    const dynamicComponents = layout.map(item => ({
        ...item,
        Component: COMPONENT_MAP[item.type]
    })).filter(item => item.Component); // تصفية المكونات غير المعروفة

    return (
        <div style={{ direction: 'rtl', fontFamily: 'var(--font-family)' }}>

            {/* 1. قسم رسالة الترحيب / حالة الصيانة */}
            {config.maintenance_mode === 'true' && (
                <div className="p-6 bg-red-100 text-red-700 rounded-xl mb-6 text-center font-semibold border border-red-300">
                    ⚠️ الموقع قيد الصيانة حالياً.
                </div>
            )}

            {/* 2. حلقة العرض الديناميكي */}
            <div className="space-y-12">
                {dynamicComponents.map((item) => {
                    const ComponentToRender = item.Component;

                    // تمرير بيانات إضافية حسب نوع المكون
                    const extraProps = {};
                    if (item.type === 'HeroSlider') {
                        extraProps.banners = banners;
                    }
                    // إذا كان ComponentToRender هو ProductGrid، فإنه سيقوم بجلب منتجاته الخاصة

                    return (
                        <div key={item.order} className={`dynamic-component-${item.type}`}>
                            <ComponentToRender props={item.props} {...extraProps} />
                        </div>
                    );
                })}
            </div>

            {/* 3. رابط احتياطي (إذا كان التخطيط فارغاً) */}
            {dynamicComponents.length === 0 && (
                <div className="text-center p-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <h1 className="text-4xl font-extrabold mb-4 text-gray-900 dark:text-gray-100" style={{ color: 'var(--primary-color)' }}>
                        {config.site_name || 'متجرنا'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                        تم تحميل إعدادات النظام بنجاح، ولكن تخطيط الصفحة الرئيسية (Layout) فارغ حالياً.
                    </p>
                    <NavLink to="/shop">
                        <Button variant="primary" className='text-lg'>اذهب لصفحة المنتجات</Button>
                    </NavLink>
                </div>
            )}

        </div>
    );
};

export default HomePage;