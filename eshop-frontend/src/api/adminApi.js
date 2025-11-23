import api from './api';

export const adminApi = {
  // جلب إحصائيات الداشبورد
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // جلب قائمة المستخدمين
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  // جلب كل الطلبات في النظام
  getAllOrders: async () => {
    const response = await api.get('/orders'); // مسار الأدمن في orderRoutes
    return response.data;
  },

  // تحديث حالة طلب (شحن/توصيل)
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
  }
};