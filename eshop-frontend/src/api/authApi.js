import api from './api';

export const authApi = {
  // تسجيل حساب جديد
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // تسجيل الدخول
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // جلب بيانات المستخدم الحالي (للتحقق من الجلسة)
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // تحديث بيانات الملف الشخصي
  updateDetails: async (details) => {
    const response = await api.put('/auth/updatedetails', details);
    return response.data;
  },

  // تسجيل الخروج (مسح الكوكيز من السيرفر)
  logout: async () => {
    const response = await api.get('/auth/logout');
    return response.data;
  }
};