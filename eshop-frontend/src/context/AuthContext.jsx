import { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../api/authApi';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // دالة للتحقق من المستخدم عند تحميل الصفحة
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
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
  };

  useEffect(() => {
    loadUser();
  }, []);

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
      const message = error.response?.data?.error || 'فشل تسجيل الدخول';
      toast.error(message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    toast.info('تم تسجيل الخروج');
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
    checkAuth: loadUser // تصدير الدالة لإعادة التحقق يدوياً إذا لزم الأمر
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;