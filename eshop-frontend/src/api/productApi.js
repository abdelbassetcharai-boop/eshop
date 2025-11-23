import api from './api';

export const productApi = {
  // --- للعامة ---

  // جلب كل المنتجات (مع دعم التصفية والترقيم)
  // params: { page, limit, keyword, category }
  getAll: async (params) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // جلب منتج واحد بالتفصيل
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // جلب تقييمات منتج
  getReviews: async (productId) => {
    const response = await api.get(`/products/${productId}/reviews`);
    return response.data;
  },

  // إضافة تقييم (يتطلب تسجيل دخول)
  addReview: async (productId, reviewData) => {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  },

  // --- للأدمن فقط ---

  // إنشاء منتج جديد
  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // تحديث منتج
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // حذف منتج
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // جلب التصنيفات (Categories) - سنضعها هنا لتسهيل الاستخدام
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  }
};