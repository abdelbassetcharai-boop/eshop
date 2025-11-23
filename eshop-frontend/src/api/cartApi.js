import api from './api';

export const cartApi = {
  // جلب السلة
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  // إضافة عنصر
  addToCart: async (productId, quantity = 1) => {
    const response = await api.post('/cart', { productId, quantity });
    return response.data;
  },

  // حذف عنصر
  removeFromCart: async (itemId) => {
    const response = await api.delete(`/cart/${itemId}`);
    return response.data;
  },

  // تنظيف السلة بالكامل
  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  }
};