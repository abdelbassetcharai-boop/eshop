import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../api/adminApi'; // استدعاء مؤقت (سيتم تحديثه لاحقاً إذا كان هناك مسار خاص للبائع)
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const VendorRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [isVendorApproved, setIsVendorApproved] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (isAuthenticated && user?.role === 'vendor') {
        try {
          // محاكاة التحقق من الاعتماد (يمكن استبدالها باستدعاء API حقيقي لاحقاً)
          // نفترض هنا أننا سنجلب حالة البائع عبر API الخاص بالأدمن أو البائع
          const response = await adminApi.getVendorsList();
          const currentVendor = response.data.find(v => v.user_id === user.id);

          if (currentVendor && currentVendor.is_approved) {
             setIsVendorApproved(true);
          } else if (currentVendor && !currentVendor.is_approved) {
             toast.warn(t('auth.vendor_pending') || 'Your vendor account is under review.');
             setIsVendorApproved(false);
          }
        } catch (error) {
          console.error('Failed to check vendor approval status', error);
          setIsVendorApproved(false);
        }
      }
      setCheckingApproval(false);
    };

    checkApprovalStatus();
  }, [isAuthenticated, user, t]);

  if (loading || checkingApproval) {
    return <LoadingSpinner fullScreen />;
  }

  // 1. غير مسجل الدخول
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. مسجل دخوله ولكن ليس بائعاً
  if (user?.role !== 'vendor') {
    return <Navigate to="/" replace />;
  }

  // 3. بائع ولكن غير معتمد
  if (!isVendorApproved) {
     return (
       <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
         <h2 className="text-2xl font-bold text-yellow-600 mb-4">{t('auth.account_pending_title') || 'Under Review'}</h2>
         <p className="text-gray-600 mb-6 max-w-md">
           {t('auth.account_pending_msg') || 'Please wait, your vendor account is being reviewed by the admin.'}
         </p>
         <Navigate to="/" replace />
       </div>
     );
  }

  // 4. بائع ومعتمد
  return <Outlet />;
};

export default VendorRoute;