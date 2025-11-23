import axios from 'axios';

// إنشاء نسخة مخصصة من Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // للسماح بإرسال واستقبال الكوكيز
});

// 1. معترض الطلبات (Request Interceptor)
// يضيف التوكن إلى ترويسة كل طلب صادر
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. معترض الاستجابات (Response Interceptor)
// يعالج الأخطاء العالمية مثل انتهاء صلاحية التوكن
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // إذا كان الخطأ 401 (غير مصرح) ولم نكن في صفحة الدخول أصلاً
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        // يمكن استخدام window.location للتوجيه الإجباري
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;