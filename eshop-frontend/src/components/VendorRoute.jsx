import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../api/adminApi'; // سنستخدم adminApi مؤقتاً لإعادة استخدام دالة getMe/getUser
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'react-toastify';

const VendorRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [isVendorApproved, setIsVendorApproved] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(true);

  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (isAuthenticated && user?.role === 'vendor') {
        try {
          // يمكن هنا استخدام مسار خاص بالبائع لجلب حالته (لم نقم بإنشائه بعد)
          // حالياً، نستخدم مسار جلب المستخدم ونفترض أن حالة الموافقة ستكون جزءاً من بياناته الموسعة.
          // في مرحلة متقدمة: يجب تعديل 'getMe' في الـ Backend لجلب حقل 'is_approved' من جدول 'vendors'

          // للتحقق بشكل مؤقت، سنقوم بمحاكاة التحقق من الموافقة
          // في التطبيق الحقيقي، يجب استدعاء API: /api/vendor/status
          const response = await adminApi.getVendorsList(); // *ملاحظة: هذا استدعاء غير فعال، سيتم استبداله لاحقاً باستدعاء API مصمم خصيصاً للبائع*

          const currentVendor = response.data.find(v => v.user_id === user.id);

          if (currentVendor && currentVendor.is_approved) {
             setIsVendorApproved(true);
          } else if (currentVendor && !currentVendor.is_approved) {
             toast.warn('حسابك قيد المراجعة. لن تتمكن من إضافة منتجات حتى تتم الموافقة عليه.');
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
  }, [isAuthenticated, user]);


  if (loading || checkingApproval) {
    return <LoadingSpinner />;
  }

  // 1. ليس مسجلاً للدخول
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. مسجل دخوله، لكن دوره ليس بائعاً
  if (user?.role !== 'vendor') {
    return <Navigate to="/" replace />;
  }

  // 3. بائع لكن غير معتمد (يمنع من الوصول للوحة التحكم ولكن لا يزال بإمكانه رؤية المتجر)
  if (!isVendorApproved) {
     return (
       <div className="text-center py-20">
         <h2 className="text-2xl font-bold text-yellow-600 mb-4">قيد المراجعة</h2>
         <p className="text-gray-600 mb-6">يرجى الانتظار، حسابك البائع قيد مراجعة المدير.</p>
         <Navigate to="/" replace />
       </div>
     );
  }

  // 4. بائع ومعتمد
  return <Outlet />;
};

export default VendorRoute;