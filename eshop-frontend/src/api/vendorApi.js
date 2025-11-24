import api from './api';

export const vendorApi = {
  // جلب إحصائيات لوحة تحكم البائع (الرصيد، المبيعات، الطلبات المعلقة)
  getStats: async () => {
    const response = await api.get('/vendor/stats');
    return response.data;
  },

  // جلب الطلبات الخاصة بهذا البائع
  getOrders: async () => {
    const response = await api.get('/vendor/orders');
    return response.data;
  },

  // تقديم طلب سحب أرباح
  requestPayout: async (payoutData) => {
    const response = await api.post('/vendor/payouts', payoutData);
    return response.data;
  },

  // جلب سجل الدفعات (طلبات السحب)
  getPayoutHistory: async () => {
    const response = await api.get('/vendor/payouts');
    return response.data;
  },

  // * ملاحظة: يمكن إضافة دوال تعديل حالة الطلب هنا في المستقبل، ولكن حالياً نعتمد على المسارات المشتركة *
};