import React from 'react';
// تم تصحيح المسار: من pages/ إلى features/orders/
import OrderHistoryFeature from '../features/orders/OrderHistoryPage';

/**
 * مكون صفحة سجل الطلبات (Order History Page Wrapper)
 * يتميز هذا الملف بكونه "صفحة" ويغلف المكون الوظيفي الأساسي (Feature).
 * هذا يتبع نمط فصل اهتمامات الـ Routing عن منطق العمل (Business Logic).
 */
const OrderHistoryPage = () => {
  return (
    // نعتمد على المكون الوظيفي (OrderHistoryFeature) الذي يحتوي على منطق جلب البيانات والعرض.
    <OrderHistoryFeature />
  );
};

export default OrderHistoryPage;