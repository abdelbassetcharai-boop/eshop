import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// استيراد ملفات الترجمة المباشرة كخيار احتياطي (Fallback)
import ar from './locales/ar.json';
import en from './locales/en.json';
import fr from './locales/fr.json';

const resources = {
  ar: { translation: ar },
  en: { translation: en },
  fr: { translation: fr }
};

i18n
  .use(HttpBackend) // تحميل الترجمات من السيرفر إذا لزم الأمر
  .use(LanguageDetector) // اكتشاف لغة المتصفح
  .use(initReactI18next) // ربط مع React
  .init({
    resources, // استخدام الموارد المستوردة محلياً للسرعة
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar', 'fr'],

    // إعدادات الكشف عن اللغة
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React يحمي من XSS تلقائياً
    },

    // إعدادات الباك إند (في حال أردت تحميل ملفات json ديناميكياً مستقبلاً)
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

// التعامل مع اتجاه الصفحة (RTL/LTR)
i18n.on('languageChanged', (lng) => {
  document.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
});

export default i18n;