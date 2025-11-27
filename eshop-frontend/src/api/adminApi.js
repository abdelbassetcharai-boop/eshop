import api from './api';

export const adminApi = {
  // ... (الدوال الأخرى: getStats, getUsers, getAllOrders, updateOrderStatus ...)
  getStats: async () => { const response = await api.get('/admin/stats'); return response.data; },
  getUsers: async () => { const response = await api.get('/admin/users'); return response.data; },
  getAllOrders: async () => { const response = await api.get('/orders'); return response.data; },
  updateOrderStatus: async (id, status) => { const response = await api.put(`/orders/${id}/status`, { status }); return response.data; },

  // تصحيح دالة الرفع
  uploadImage: async (formData) => {
    // لا تقم بتعيين Content-Type يدوياً عند استخدام FormData، المتصفح يفعل ذلك تلقائياً مع Boundary صحيح
    const response = await api.post('/upload', formData);
    return response.data;
  },

  // ... (بقية الدوال: createCategory, deleteCategory, getVendorsList, approveVendor, getPayoutRequests, processPayout, getStoreSettings, updateStoreSettings, getAllPayments)
  createCategory: async (data) => { const response = await api.post('/categories', data); return response.data; },
  deleteCategory: async (id) => { const response = await api.delete(`/categories/${id}`); return response.data; },
  getVendorsList: async () => { const response = await api.get('/admin/vendors'); return response.data; },
  approveVendor: async (userId) => { const response = await api.put(`/admin/vendors/${userId}/approve`); return response.data; },
  getPayoutRequests: async () => { const response = await api.get('/admin/payouts'); return response.data; },
  processPayout: async (payoutId) => { const response = await api.put(`/admin/payouts/${payoutId}/process`); return response.data; },
  getStoreSettings: async () => { const response = await api.get('/admin/settings'); return response.data; },
  updateStoreSettings: async (data) => { const response = await api.put('/admin/settings', data); return response.data; },
  getAllPayments: async () => { const response = await api.get('/admin/payments'); return response.data; }
};