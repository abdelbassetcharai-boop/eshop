import axios from 'axios';
import { toast } from 'react-toastify';
import i18n from '../i18n'; // لاستخدام اللغة الحالية في الطلبات

// إنشاء نسخة مخصصة من Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // للسماح بإرسال واستقبال الكوكيز
  timeout: 10000, // مهلة 10 ثوانٍ
});

// 1. معترض الطلبات (Request Interceptor)
api.interceptors.request.use(
  (config) => {
    // إضافة التوكن
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // إضافة لغة المستخدم الحالية (ليعرف الباك إند اللغة المفضلة للردود إن وجد)
    config.headers['Accept-Language'] = i18n.language || 'en';

    return config;
  },
  (error) => Promise.reject(error)
);

// 2. معترض الاستجابات (Response Interceptor)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // معالجة أخطاء الاتصال (Network Error)
    if (!error.response) {
      toast.error(i18n.t('common.error') + ': Network Error');
      return Promise.reject(error);
    }

    // معالجة انتهاء الصلاحية (401 Unauthorized)
    if (error.response.status === 401 && !originalRequest._retry) {
      // إذا لم نكن في صفحة الدخول أصلاً لتجنب التكرار
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        // توجيه المستخدم لصفحة الدخول (يمكن تحسينه باستخدام navigate داخل المكونات)
        window.location.href = '/login';
        toast.error(i18n.t('auth.session_expired') || 'Session expired, please login again.');
      }
    }

    // معالجة أخطاء الخادم (500)
    if (error.response.status >= 500) {
        toast.error(i18n.t('common.error') || 'Server error occurred.');
    }

    return Promise.reject(error);
  }
);

export default api;