import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { toast } from 'react-toastify';
// استيراد jwt-decode بشكل صحيح حسب المكتبة المثبتة (قد تحتاج لتعديل الاستيراد حسب النسخة)
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // التحقق من صلاحية التوكن
  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token || !isTokenValid(token)) {
      if (token) {
        // التوكن موجود لكنه منتهي الصلاحية
        localStorage.removeItem('token');
        toast.info('انتهت جلسة الدخول، يرجى تسجيل الدخول مرة أخرى');
      }
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      if (res.success) {
        setUser(res.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Load user failed', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const register = async (userData) => {
    try {
      const res = await authApi.register(userData);
      if (res.success) {
        localStorage.setItem('token', res.token);
        setUser(res.user);
        setIsAuthenticated(true);
        toast.success('تم التسجيل بنجاح! 🎉');
        return true;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'فشل التسجيل';
      toast.error(message);
      return false;
    }
  };

  const login = async (credentials) => {
    try {
      const res = await authApi.login(credentials);
      if (res.success) {
        localStorage.setItem('token', res.token);
        setUser(res.user);
        setIsAuthenticated(true);
        toast.success('مرحباً بعودتك! 👋');
        return true;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'بيانات الدخول غير صحيحة';
      toast.error(message);
      return false;
    }
  };

  const logout = async () => {
    try {
      // محاولة تسجيل الخروج من السيرفر (اختياري حسب الباك إند)
      await authApi.logout();
    } catch (err) {
      console.error('Logout error', err);
    }
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    toast.info('تم تسجيل الخروج');
    // يمكن استخدام navigate هنا إذا تم تمريره أو الاعتماد على تحديث الحالة لإعادة التوجيه في المكونات
    window.location.href = '/login';
  };

  const updateProfile = async (details) => {
    try {
      const res = await authApi.updateDetails(details);
      if (res.success) {
        setUser(res.data);
        toast.success('تم تحديث الملف الشخصي');
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل التحديث');
      return false;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile,
    checkAuth: loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;