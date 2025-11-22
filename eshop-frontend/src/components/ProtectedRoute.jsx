import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
// المسار الصحيح: من components إلى context
import { useAuth } from '../context/AuthContext';
// المسار الصحيح: LoadingSpinner في نفس المجلد (components)
import LoadingSpinner from './LoadingSpinner';

/**
 * مكون لحماية المسارات بناءً على المصادقة والدور.
 * هذا المكون هو مفتاح منطق التصريح (Authorization).
 * @param {string} requiredRole - الدور المطلوب للوصول (مثل 'admin', 'vendor').
 */
const ProtectedRoute = ({ requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // 1. عرض سبينر التحميل أثناء التحقق من التوكن (فحص الـ Bootstrap)
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // 2. إذا لم يكن مصادقاً، أعد التوجيه لصفحة تسجيل الدخول
  if (!isAuthenticated) {
    // Navigate هنا تحل محل history.push لتطبيقات React Router v6
    return <Navigate to="/login" replace />;
  }

  // 3. التحقق من الدور المطلوب
  if (requiredRole) {
    const userRole = user?.role;

    // القاعدة الذهبية: المشرف يمكنه رؤية جميع مسارات البائعين.
    const isAuthorized = userRole === requiredRole || userRole === 'admin';

    if (!isAuthorized) {
      // إذا كان الدور مطلوباً ولم يتطابق، أعد التوجيه لصفحة عدم التصريح
      console.warn(`Access denied. User role: ${userRole}, Required role: ${requiredRole}`);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // 4. السماح بالوصول للمكونات الفرعية (عرض محتوى المسار)
  return <Outlet />;
};

export default ProtectedRoute;