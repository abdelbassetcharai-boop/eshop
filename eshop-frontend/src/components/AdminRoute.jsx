import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const AdminRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  // يجب أن يكون مسجلاً للدخول + أن يكون دوره 'admin' فقط
  if (isAuthenticated && user?.role === 'admin') {
    return <Outlet />;
  }

  // إذا كان مسجلاً ولكن ليس أدمن (قد يكون بائع أو عميل)، نعيده للصفحة الرئيسية
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // إذا لم يكن مسجلاً، نعيده لصفحة الدخول مع حفظ المسار للعودة إليه
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default AdminRoute;