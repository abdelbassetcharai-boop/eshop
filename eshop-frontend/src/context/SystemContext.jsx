import React, { createContext, useState, useEffect, useContext } from 'react';
import { getBootstrapApi } from '../api/authApi'; // جلب خدمة الـ Bootstrap

const SystemContext = createContext();

/**
 * يوفر الوصول إلى الإعدادات الديناميكية للمتجر (Theme, Translations, Layout)
 * ويطبق متغيرات CSS عالمياً.
 */
const SystemProvider = ({ children }) => {
  const [systemData, setSystemData] = useState({
    config: {},         // إعدادات عامة (site_name, default_currency)
    theme: {},          // إعدادات الثيم (colors, fonts)
    translations: {},   // نصوص الواجهة (i18n)
    isLoaded: false,    // حالة التحميل الأولي
    layout: [],         // تخطيط الصفحة الرئيسية (JSONB)
    shippingZones: [],  // مناطق الشحن
    banners: [],        // البنرات الإعلانية
  });

  useEffect(() => {
    const loadSystemConfig = async () => {
      try {
        // جلب جميع الإعدادات العامة من الـ Backend في طلب واحد
        // *** response الآن تحتوي على الكائن الكامل: { success: true, data: {...} } ***
        const response = await getBootstrapApi('ar');

        const data = response?.data; // نُزيل مستوى واحد من data

        if (!data || !response.success) {
             console.warn("Bootstrap API returned success but no data payload.");
             setSystemData(prev => ({ ...prev, isLoaded: true }));
             return;
        }

        setSystemData({
          config: data.config,
          theme: data.theme,
          translations: data.translations,
          isLoaded: true,
          layout: data.layout,
          shippingZones: data.shipping_zones,
          banners: data.banners,
        });

        // ==========================================================
        // التطبيق الديناميكي للثيم كمتغيرات CSS (CSS Variables)
        // ==========================================================
        const root = document.documentElement.style;
        root.setProperty('--primary-color', data.theme['--primary-color'] || '#059669');
        root.setProperty('--secondary-color', data.theme['--secondary-color'] || '#3B82F6');
        root.setProperty('--font-family', data.theme['--font-family'] || 'Cairo, sans-serif');
        root.setProperty('--border-radius', data.theme['--border-radius'] || '0.75rem');

      } catch (error) {
        // يتم طباعة الخطأ هنا: فشل في الاتصال أو فشل في الخادم (500)
        console.error('❌ فشل تحميل إعدادات النظام (Bootstrap Error):', error);
        setSystemData(prev => ({ ...prev, isLoaded: true }));
      }
    };
    loadSystemConfig();
  }, []);

  return (
    <SystemContext.Provider value={systemData}>
      {children}
    </SystemContext.Provider>
  );
};

/**
 * Hook مخصص للوصول السهل إلى سياق النظام.
 */
const useSystem = () => useContext(SystemContext);

export { SystemProvider, useSystem };