import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    // توجيه المستخدم لصفحة الدخول مع حفظ الصفحة التي كان يحاول الوصول إليها
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default ProtectedRoute;