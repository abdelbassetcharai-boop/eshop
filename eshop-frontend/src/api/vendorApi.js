import api from './api';

export const vendorApi = {
  // إحصائيات البائع
  getStats: async () => {
    const response = await api.get('/vendor/stats');
    return response.data;
  },

  // طلبات البائع
  getOrders: async () => {
    const response = await api.get('/vendor/orders');
    return response.data;
  },

  // سحب الأرباح
  requestPayout: async (payoutData) => {
    const response = await api.post('/vendor/payouts', payoutData);
    return response.data;
  },

  getPayoutHistory: async () => {
    const response = await api.get('/vendor/payouts');
    return response.data;
  }
};