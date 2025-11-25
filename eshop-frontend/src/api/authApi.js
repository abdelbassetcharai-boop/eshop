import api from './api';

export const authApi = {
  // تسجيل حساب جديد
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // تسجيل بائع جديد
  registerVendor: async (vendorData) => {
    const response = await api.post('/auth/vendor/register', vendorData);
    return response.data;
  },

  // تسجيل الدخول
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // جلب بيانات المستخدم الحالي
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // تحديث بيانات الملف الشخصي
  updateDetails: async (details) => {
    const response = await api.put('/auth/updatedetails', details);
    return response.data;
  },

  // تسجيل الخروج
  logout: async () => {
    const response = await api.get('/auth/logout');
    return response.data;
  }
};