import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/api';

const SystemContext = createContext();

export const useSystem = () => useContext(SystemContext);

export const SystemProvider = ({ children }) => {
  const [config, setConfig] = useState({
    currency: { code: 'MAD', symbol: 'د.م.' },
    taxRate: 0.15,
    shippingFee: 20,
    freeShippingThreshold: 500,
    paymentMethods: { cod: true, stripe: false },
    siteName: 'EShop'
  });
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        const results = await Promise.allSettled([
          api.get('/public/bootstrap'),
          api.get('/public/banners')
        ]);

        if (results[0].status === 'fulfilled' && results[0].value.data.success) {
            setConfig(prev => ({ ...prev, ...results[0].value.data.data }));
        }
        if (results[1].status === 'fulfilled' && results[1].value.data.success) {
            setBanners(results[1].value.data.data);
        }
      } catch (error) {
        console.error('Failed to load system data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSystemData();
  }, []);

  return (
    <SystemContext.Provider value={{ config, banners, loading }}>
      {children}
    </SystemContext.Provider>
  );
};

export default SystemContext;