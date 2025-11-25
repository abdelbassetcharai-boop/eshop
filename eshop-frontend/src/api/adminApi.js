import api from './api';

export const adminApi = {
  // --- إحصائيات ---
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // --- المستخدمين ---
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  // --- الطلبات ---
  getAllOrders: async () => {
    const response = await api.get('/orders'); // مسار مشترك (للأدمن صلاحية رؤية الكل)
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  // --- الصور ---
  uploadImage: async (formData) => {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // --- التصنيفات ---
  createCategory: async (data) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // --- البائعين والمدفوعات ---
  getVendorsList: async () => {
    const response = await api.get('/admin/vendors');
    return response.data;
  },

  approveVendor: async (userId) => {
    const response = await api.put(`/admin/vendors/${userId}/approve`);
    return response.data;
  },

  getPayoutRequests: async () => {
    const response = await api.get('/admin/payouts');
    return response.data;
  },

  processPayout: async (payoutId) => {
    const response = await api.put(`/admin/payouts/${payoutId}/process`);
    return response.data;
  }
};