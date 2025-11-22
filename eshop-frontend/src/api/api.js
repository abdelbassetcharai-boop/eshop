import axios from 'axios';

// يجب استخدام عنوان URL الخاص بالـ Backend
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor لمعالجة الأخطاء الشائعة (مثل انتهاء صلاحية التوكن)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      // إذا انتهت صلاحية التوكن، قم بتسجيل الخروج تلقائياً
      console.error('Unauthorized access. Token expired or invalid.');
      // ملاحظة: يجب استخدام دالة logout من AuthContext هنا،
      // ولكن للتبسيط المبدئي نكتفي بتسجيل الخطأ.
    }

    // إرجاع خطأ مبسط للتحكم في واجهة المستخدم
    const errorMessage = error.response?.data?.error || error.response?.data?.message || 'An unexpected error occurred.';
    return Promise.reject({
        message: errorMessage,
        details: error.response?.data?.details // لعرض أخطاء الـ Validation
    });
  }
);

// دالة لتعيين التوكن في جميع الطلبات المستقبلية
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;