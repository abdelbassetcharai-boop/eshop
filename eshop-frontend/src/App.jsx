import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ==========================================================
// I. استيراد السياقات (Providers) - الملفات 6 و 7
// تم تصحيح المسارات إلى الصيغة './context/...'
// ==========================================================
import { AuthProvider, useAuth } from './context/AuthContext';
import { SystemProvider, useSystem } from './context/SystemContext';

// ==========================================================
// II. استيراد المكونات المشتركة - الملفات 10, 13, 14
// تم تصحيح المسارات إلى الصيغة './components/...'
// ==========================================================
import LoadingSpinner from './components/LoadingSpinner';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// ==========================================================
// III. استيراد صفحات الـ Routing - الملفات 29, 30, 31, 32
// تم تصحيح المسارات إلى الصيغة './pages/...' و './features/...'
// ==========================================================
// Pages (Wrapper Components)
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import NotFoundPage from './pages/NotFoundPage';

// Features (Pages directly used for Routing)
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Profile from './features/auth/Profile';
import CartPage from './features/cart_checkout/CartPage';
import CheckoutPage from './features/cart_checkout/CheckoutPage';
import AdminDashboard from './features/admin/AdminDashboard';
import ProductManagement from './features/admin/ProductManagement'; // لإضافة مسار إداري
import SystemSettings from './features/admin/SystemSettings'; // لإضافة مسار إداري


// ==========================================================
// IV. المكون الرئيسي للتطبيق - يتحقق من التحميل الأولي
// ==========================================================
const AppContent = () => {
  const { isLoaded, config } = useSystem();
  const { isLoading } = useAuth();

  // مكون لصفحة عدم التصريح (403)
  const UnauthorizedPage = () => (
    <div className="text-center p-10 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 rounded-xl border border-yellow-300">
      <h1 className='text-2xl font-bold'>403 - غير مصرح بالوصول</h1>
      <p>ليس لديك الصلاحيات اللازمة لعرض هذه الصفحة.</p>
    </div>
  );

  // 1. عرض شاشة تحميل أولية (Bootstrap + Auth Check)
  if (!isLoaded || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  // 2. التحقق من وضع الصيانة (Maintenance Mode)
  if (config.maintenance_mode === 'true') {
    // عرض صفحة الصيانة (ما لم يكن المستخدم مشرفاً)
    // هنا يجب استخدام useAuth().user مباشرة بدلاً من استدعائها مرتين
    const auth = useAuth();
    if (auth.user?.role !== 'admin') {
      return (
        <div className="text-center p-10 bg-red-100 min-h-screen flex flex-col justify-center items-center">
           <h1 className='text-4xl font-bold text-red-700'>المتجر قيد الصيانة</h1>
           <p className='text-lg text-gray-600 mt-4'>نحن نعمل حالياً على تحسينات للموقع. سنعود قريباً.</p>
        </div>
      );
    }
  }


  // 3. مسارات التطبيق الرئيسية (Routing)
  return (
    <Router>
      <Routes>
        {/* المسار الأساسي يستخدم مكون Layout (Header + Footer) */}
        <Route path="/" element={<Layout />}>

          {/* مسارات عامة (لا تحتاج مصادقة) */}
          <Route index element={<HomePage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="products/:id" element={<ProductManagement />} /> {/* استخدام ProductManagement للعرض */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="unauthorized" element={<UnauthorizedPage />} />

          {/* مسارات محمية - تتطلب تسجيل دخول (Customer/Vendor/Admin) */}
          <Route element={<ProtectedRoute />}>
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<OrderHistoryPage />} />
          </Route>

          {/* مسارات الإدارة - تتطلب دور محدد (Vendor/Admin) */}
          {/* نستخدم ProtectedRoute لفرض التحقق من الدور */}
          <Route element={<ProtectedRoute requiredRole="vendor" />}>
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/product-management" element={<ProductManagement />} />
          </Route>

          {/* مسارات المشرف النقي - تتطلب دور Admin فقط */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="admin/system-settings" element={<SystemSettings />} />
          </Route>


          {/* مسار غير موجود (404) */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
};


// 4. المكون الجذري (App Component)
export default function App() {
  return (
    <SystemProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SystemProvider>
  );
}