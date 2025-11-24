import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import RegisterVendor from './features/auth/RegisterVendor'; // جديد: تسجيل بائع
import Profile from './features/auth/Profile';
import OrderHistoryPage from './pages/OrderHistoryPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import VendorRoute from './components/VendorRoute'; // جديد: حماية مسارات البائع
import VendorDashboardPage from './pages/vendor/VendorDashboardPage'; // جديد: لوحة تحكم البائع

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* --- المسارات العامة (Public Routes) --- */}
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="register-vendor" element={<RegisterVendor />} /> {/* مسار تسجيل البائع */}

        {/* --- مسارات العملاء المحمية (Customer Routes) --- */}
        <Route element={<ProtectedRoute />}>
           <Route path="profile" element={<Profile />} />
           <Route path="orders" element={<OrderHistoryPage />} />
           <Route path="checkout" element={<CheckoutPage />} />
        </Route>

        {/* --- مسارات المدير (Admin Routes) --- */}
        <Route path="/admin" element={<AdminRoute />}>
           <Route path="dashboard" element={<AdminDashboardPage />} />
        </Route>

        {/* --- مسارات البائع (Vendor Routes) --- */}
        {/* محمي بواسطة VendorRoute الذي يتحقق من الدور وحالة الاعتماد */}
        <Route path="/vendor" element={<VendorRoute />}>
           <Route path="dashboard" element={<VendorDashboardPage />} />
        </Route>

        {/* --- صفحة 404 --- */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;