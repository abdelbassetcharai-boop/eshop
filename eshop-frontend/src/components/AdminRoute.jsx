import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const AdminRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // يجب أن يكون مسجلاً للدخول + أن يكون دوره 'admin' فقط
  if (isAuthenticated && user?.role === 'admin') {
    return <Outlet />;
  }

  // إذا كان مسجلاً ولكن ليس أدمن (قد يكون بائع أو عميل)، نعيده للصفحة الرئيسية
  // إذا لم يكن مسجلاً، نعيده لصفحة الدخول
  return isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />;
};

export default AdminRoute;