import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/api'; // استخدام العميل المباشر لأن هذه المسارات عامة

const SystemContext = createContext();

export const useSystem = () => useContext(SystemContext);

export const SystemProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        // جلب الإعدادات والبنرات بشكل متوازي
        const [configRes, bannersRes] = await Promise.all([
          api.get('/public/bootstrap'),
          api.get('/public/banners')
        ]);

        if (configRes.data.success) setConfig(configRes.data.data);
        if (bannersRes.data.success) setBanners(bannersRes.data.data);

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