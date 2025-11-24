import api from './api';

export const adminApi = {
  // --- إحصائيات عامة ---
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // --- إدارة المستخدمين (العملاء) ---
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  // --- إدارة الطلبات (الكل) ---
  getAllOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  // تحديث حالة طلب
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  // رفع صورة (للمنتجات أو التصنيفات)
  uploadImage: async (formData) => {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // إدارة التصنيفات (Categories)
  createCategory: async (data) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // ------------------------------------------
  // --- دوال إدارة البائعين والمدفوعات (جديد) ---
  // ------------------------------------------

  // جلب قائمة البائعين (VendorsTable)
  getVendorsList: async () => {
    const response = await api.get('/admin/vendors');
    return response.data;
  },

  // اعتماد حساب بائع
  approveVendor: async (userId) => {
    const response = await api.put(`/admin/vendors/${userId}/approve`);
    return response.data;
  },

  // جلب طلبات السحب (PayoutRequests.jsx)
  getPayoutRequests: async () => {
    const response = await api.get('/admin/payouts');
    return response.data;
  },

  // معالجة طلب سحب
  processPayout: async (payoutId) => {
    const response = await api.put(`/admin/payouts/${payoutId}/process`);
    return response.data;
  }
};