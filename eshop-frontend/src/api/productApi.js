import api from './api';

// ====================================================================
// خدمات المنتجات والفئات (Product & Category Services)
// ====================================================================

/**
 * جلب جميع المنتجات مع خيارات التصفية والبحث (لصفحة Shop).
 * @param {object} params - معلمات الاستعلام (page, limit, categoryId, search).
 */
export const getAllProductsApi = (params) => api.get('/products', { params });

/**
 * جلب تفاصيل منتج محدد.
 */
export const getProductByIdApi = (productId) => api.get(`/products/${productId}`);

/**
 * جلب جميع الفئات النشطة.
 */
export const getAllCategoriesApi = () => api.get('/categories');

// ====================================================================
// خدمات CRUD للمنتجات (للبائعين/المشرفين)
// ====================================================================

/**
 * إنشاء منتج جديد (يتطلب دور Vendor/Admin).
 */
export const createProductApi = (data) => api.post('/products', data);

/**
 * تحديث منتج موجود (يتطلب دور Vendor/Admin).
 */
export const updateProductApi = (id, data) => api.put(`/products/${id}`, data);

/**
 * حذف منتج (يتطلب دور Vendor/Admin).
 */
export const deleteProductApi = (id) => api.delete(`/products/${id}`);


// ====================================================================
// خدمات التقييمات (Reviews) - تتطلب مصادقة
// ====================================================================

/**
 * إضافة تقييم لمنتج محدد.
 * @param {number} productId - معرّف المنتج.
 * @param {object} data - يحتوي على rating (1-5) و comment.
 */
export const addReviewApi = (productId, data) => api.post(`/products/${productId}/reviews`, data);