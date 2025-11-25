import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/api';

const SystemContext = createContext();

export const useSystem = () => useContext(SystemContext);

export const SystemProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        // جلب البيانات العامة (البنرات والإعدادات)
        // نستخدم Promise.allSettled لضمان عدم توقف التطبيق لو فشل أحدهما
        const results = await Promise.allSettled([
          api.get('/public/bootstrap'),
          api.get('/public/banners')
        ]);

        const configRes = results[0];
        const bannersRes = results[1];

        if (configRes.status === 'fulfilled' && configRes.value.data.success) {
            setConfig(configRes.value.data.data);
        }

        if (bannersRes.status === 'fulfilled' && bannersRes.value.data.success) {
            setBanners(bannersRes.value.data.data);
        }

      } catch (error) {
        console.error('Failed to load system data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemData();
  }, []);

  const value = {
    config,
    banners,
    loading
  };

  return (
    <SystemContext.Provider value={value}>
      {children}
    </SystemContext.Provider>
  );
};

export default SystemContext;