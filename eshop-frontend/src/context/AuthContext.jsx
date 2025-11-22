import React, { createContext, useState, useEffect, useContext } from 'react';
// استيراد خدمات المصادقة من ملف الـ API رقم 2
import { loginApi, registerApi, getProfileApi } from '../api/authApi';
// استيراد دالة تعيين التوكن من ملف الـ API رقم 1
import { setAuthToken } from '../api/api';

const AuthContext = createContext();

/**
 * يوفر الوصول إلى حالة المصادقة ومعلومات المستخدم (بما في ذلك الدور).
 */
const AuthProvider = ({ children }) => {
  // جلب التوكن من التخزين المحلي عند التحميل الأولي
  const initialToken = localStorage.getItem('token');
  const [token, setToken] = useState(initialToken);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialToken);
  const [isLoading, setIsLoading] = useState(true);

  // تأثير جانبي لتعيين التوكن وجلب الملف الشخصي عند تحميل التطبيق أو تغيير التوكن
  useEffect(() => {
    // تعيين التوكن في Axios Header لجميع الطلبات
    setAuthToken(token);
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  // جلب بيانات المستخدم بعد تسجيل الدخول أو عند تحميل الصفحة
  const fetchProfile = async () => {
    try {
      const response = await getProfileApi();
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch profile. Token might be invalid.', error);
      // مسح التوكن غير الصالح
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * تسجيل دخول المستخدم.
   */
  const login = async (email, password) => {
    const response = await loginApi({ email, password });
    const { token: newToken, user: userData } = response;

    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  /**
   * تسجيل مستخدم جديد.
   */
  const register = async (name, email, password) => {
    const response = await registerApi({ name, email, password });
    // يتم تسجيل الدخول تلقائياً بعد التسجيل
    const { token: newToken, user: userData } = response;

    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  /**
   * تسجيل الخروج وإزالة التوكن من كل مكان.
   */
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthToken(null); // تحديث Axios Header
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      fetchProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook مخصص للوصول السهل إلى سياق المصادقة.
 */
const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };