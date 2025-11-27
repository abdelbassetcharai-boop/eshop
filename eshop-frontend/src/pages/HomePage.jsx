import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../components/ui/Button';
// تم حذف HeroScene: import HeroScene from '../components/3d/HeroScene';
import ProductList from '../features/products/ProductList';
import { productApi } from '../api/productApi';
import { ArrowRight, ArrowLeft, Truck, ShieldCheck, CreditCard, Headphones } from 'lucide-react';


// تسجيل إضافة ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// قائمة صور الخلفية (يجب استبدالها بمسارات صور حقيقية)
const backgroundImages = [
    '/src/assets/online-shopping-concept.jpg',
    '/src/assets/2151896833.jpg',
    '/src/assets/online-shopping-concept.jpg',
];

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  // Refs للعناصر التي سيتم تحريكها
  const heroTextRef = useRef(null);
  const featuresRef = useRef(null);
  const productsRef = useRef(null);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // حالة الصورة الحالية

  // useEffect لتغيير الصورة كل 5 ثوانٍ
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000); // تغيير كل 5 ثوانٍ

    return () => clearInterval(interval);
  }, []);

  // جلب المنتجات المميزة
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await productApi.getAll({ limit: 4 });
        if (res.success) {
          setFeaturedProducts(res.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // إعداد GSAP Animations
  useEffect(() => {
    // تحريك النص الرئيسي في الـ Hero Section
    const ctx = gsap.context(() => {
      gsap.from(heroTextRef.current.children, {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.5
      });

      // تحريك قسم الميزات عند التمرير
      gsap.from(featuresRef.current.children, {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 80%',
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'back.out(1.7)'
      });
    });

    return () => ctx.revert(); // تنظيف الأنيميشن عند الخروج
  }, []);

  const features = [
    { icon: Truck, title: t('footer.features.shipping_title'), desc: t('footer.features.shipping_desc') },
    { icon: ShieldCheck, title: t('footer.features.warranty_title'), desc: t('footer.features.warranty_desc') },
    { icon: CreditCard, title: t('footer.features.payment_title'), desc: t('footer.features.payment_desc') },
    { icon: Headphones, title: t('footer.support_center'), desc: t('footer.contact_us') },
  ];

  return (
    // تم حذف pt-36 لتجنب الفراغ الكبير
    <div className="space-y-16 md:space-y-20 pb-16 md:pb-20">

      {/* --- Hero Section (الخلفية المتحركة) --- */}
      <section
        className="relative min-h-[85vh] md:min-h-[80vh] flex items-center overflow-hidden pt-20 transition-all duration-1000 ease-in-out bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImages[currentImageIndex]})` }} // 👈 تطبيق الصورة المتحركة
      >
        {/* طبقة تظليل (Overlay) لجعل النص مقروءًا */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center relative z-10">

          {/* النص (Text Content) */}
          <div ref={heroTextRef} className="z-10 text-center mb-8 max-w-4xl">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-4 sm:mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-300"> {/* تعديل الألوان لتباين أفضل مع الخلفية الداكنة */}
                {t('hero.title')}
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-200 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link to="/shop" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" className="w-full sm:w-auto shadow-xl shadow-primary-500/20">
                  {t('hero.cta')}
                  {isRTL ? <ArrowLeft className="mr-2 h-5 w-5" /> : <ArrowRight className="ml-2 h-5 w-5" />}
                </Button>
              </Link>
              <Link to="/about" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white/20 text-white hover:bg-white/30 border-white/30">
                  {t('footer.links.about')}
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* --- Features Section --- */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={featuresRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-dark-card p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm
              border border-gray-100 dark:border-gray-700 transition-transform duration-300 group hover:shadow-md hover:-translate-y-1
              flex flex-col justify-center
              min-h-[180px]
              "
            >
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-primary-50 dark:bg-primary-900/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
              </div>

              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Featured Products --- */}
      <section ref={productsRef} className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('footer.links.products')}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {t('hero.subtitle').split('.')[0]}
            </p>
          </div>
          <Link to="/shop">
            <Button variant="ghost" className="group w-full sm:w-auto">
              {t('shop.filter')}
              {isRTL ?
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> :
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              }
            </Button>
          </Link>
        </div>

        {/* استخدام مكون قائمة المنتجات الموجود (أو المحدث لاحقاً) */}
        <ProductList products={featuredProducts} />
      </section>

      {/* --- CTA Banner --- */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden p-6 sm:p-8 lg:p-12 text-center sm:text-start rtl:sm:text-right">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 sm:w-64 sm:h-64 bg-primary-600 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 sm:w-64 sm:h-64 bg-secondary-600 rounded-full opacity-20 blur-3xl"></div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
                {t('auth.vendor_register')}
              </h2>
              <p className="text-slate-300 max-w-xl text-sm sm:text-base lg:text-lg">
                {t('footer.links.become_vendor')}
              </p>
            </div>
            <Link to="/register-vendor" className="flex-1 sm:flex-none">
              <Button size="lg" variant="gradient" className="w-full sm:w-auto shadow-xl shadow-orange-500/20">
                {t('auth.vendor_register')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;