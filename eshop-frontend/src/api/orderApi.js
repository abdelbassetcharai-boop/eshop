import api from './api';

// ====================================================================
// خدمات سلة التسوق (Cart Services)
// ====================================================================

/**
 * جلب محتويات سلة التسوق للمستخدم الحالي.
 */
export const getCartApi = () => api.get('/cart');

/**
 * إضافة منتج جديد إلى سلة التسوق.
 * @param {object} data - يحتوي على product_id و quantity.
 */
export const addToCartApi = (data) => api.post('/cart', data);

/**
 * تحديث كمية منتج محدد في السلة.
 * @param {number} itemId - معرّف العنصر في السلة (cart_id).
 * @param {object} data - يحتوي على quantity الجديدة.
 */
export const updateCartItemApi = (itemId, data) => api.put(`/cart/${itemId}`, data);

/**
 * إزالة عنصر محدد من السلة.
 * @param {number} itemId - معرّف العنصر في السلة (cart_id).
 */
export const removeFromCartApi = (itemId) => api.delete(`/cart/${itemId}`);

/**
 * تفريغ سلة التسوق بالكامل.
 */
export const clearCartApi = () => api.delete('/cart');


// ====================================================================
// خدمات الطلبات (Order Services)
// ====================================================================

/**
 * إنشاء طلب جديد من محتويات السلة.
 * @param {object} data - يحتوي على shipping_address, payment_method, shipping_cost.
 */
export const createOrderApi = (data) => api.post('/orders', data);

/**
 * جلب سجل طلبات المستخدم.
 */
export const getUserOrdersApi = () => api.get('/orders');

/**
 * جلب تفاصيل طلب محدد.
 * @param {number} orderId - معرّف الطلب.
 */
export const getOrderByIdApi = (orderId) => api.get(`/orders/${orderId}`);

/**
 * إلغاء طلب محدد (متاح فقط للحالة 'pending').
 * @param {number} orderId - معرّف الطلب.
 */
export const cancelOrderApi = (orderId) => api.put(`/orders/${orderId}/cancel`);


// ====================================================================
// خدمات الشحن والعناوين (Shipping & Address Services)
// ====================================================================

/**
 * جلب جميع مناطق الشحن النشطة المتاحة.
 */
export const getShippingZonesApi = () => api.get('/shipping/zones');

/**
 * حساب تكلفة الشحن بناءً على المنطقة والوزن/السعر (لصفحة Checkout).
 * @param {object} data - يحتوي على shipping_zone_id, total_price, [total_weight].
 */
export const calculateShippingApi = (data) => api.post('/shipping/calculate', data);

/**
 * جلب عناوين المستخدم المحفوظة.
 */
export const getUserAddressesApi = () => api.get('/addresses');

/**
 * إضافة عنوان جديد.
 * @param {object} data - يحتوي على title, address, city, phone.
 */
export const addAddressApi = (data) => api.post('/addresses', data);