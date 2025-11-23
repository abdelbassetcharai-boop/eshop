import api from './api';

export const orderApi = {
  // إنشاء طلب جديد
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // جلب طلبات المستخدم الحالي
  getMyOrders: async () => {
    const response = await api.get('/orders/myorders');
    return response.data;
  },

  // جلب تفاصيل طلب محدد
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  }
};