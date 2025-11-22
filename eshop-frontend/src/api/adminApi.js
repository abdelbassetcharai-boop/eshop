import api from './api';

// ====================================================================
// خدمات لوحة التحكم والإدارة (Admin & Vendor Services)
// ====================================================================

/**
 * جلب إحصائيات لوحة القيادة (Dashboard Stats)
 */
export const getDashboardStatsApi = () => api.get('/admin/dashboard');

/**
 * جلب قائمة الطلبات (Orders) مع دعم التصفية حسب الدور والحالة.
 */
export const getAllOrdersAdminApi = (params) => api.get('/admin/orders', { params });

/**
 * تحديث حالة طلب محدد (للمشرف أو البائع).
 */
export const updateOrderStatusApi = (orderId, data) => api.put(`/admin/orders/${orderId}/status`, data);

/**
 * جلب قائمة المنتجات للإدارة (Admin Products List).
 */
export const getAllProductsAdminApi = (params) => api.get('/admin/products', { params });

// ====================================================================
// خدمات تحديث النظام الديناميكي (System Configs)
// ====================================================================

/**
 * تحديث إعدادات النظام العامة (site_name, default_currency, maintenance_mode)
 */
export const updateConfigsApi = (data) => api.put('/admin/system/configs', data);

/**
 * تحديث إعدادات الثيم (الألوان والخطوط)
 */
export const updateThemeApi = (data) => api.put('/admin/system/theme', data);

/**
 * تحديث تخطيط الصفحة الرئيسية (Layout JSONB)
 */
export const updatePageLayoutApi = (data) => api.put('/admin/system/layout', data);


// ====================================================================
// خدمات CRUD للجداول الديناميكية (Categories, Banners, Shipping Zones, etc.)
// ====================================================================

// --- 1. إدارة الفئات (Categories) ---
export const getCategoriesAdminApi = () => api.get('/admin/categories');
export const createCategoryApi = (data) => api.post('/admin/categories', data);
export const updateCategoryApi = (id, data) => api.put(`/admin/categories/${id}`, data);
export const deleteCategoryApi = (id) => api.delete(`/admin/categories/${id}`);

// --- 2. إدارة مناطق الشحن (Shipping Zones) ---
export const getShippingZonesAdminApi = () => api.get('/admin/shipping-zones');
export const createShippingZoneApi = (data) => api.post('/admin/shipping-zones', data);
export const updateShippingZoneApi = (id, data) => api.put(`/admin/shipping-zones/${id}`, data);
export const deleteShippingZoneApi = (id) => api.delete(`/admin/shipping-zones/${id}`);

// --- 3. إدارة البنرات (Banners) ---
export const getBannersAdminApi = () => api.get('/admin/banners');
export const createBannerApi = (data) => api.post('/admin/banners', data);
export const updateBannerApi = (id, data) => api.put(`/admin/banners/${id}`, data);
export const deleteBannerApi = (id) => api.delete(`/admin/banners/${id}`);

// --- 4. إدارة الترجمة (Translations) ---
export const getTranslationsAdminApi = () => api.get('/admin/translations');
export const createTranslationApi = (data) => api.post('/admin/translations', data);
export const updateTranslationApi = (key, data) => api.put(`/admin/translations/${key}`, data);
export const deleteTranslationApi = (key) => api.delete(`/admin/translations/${key}`);