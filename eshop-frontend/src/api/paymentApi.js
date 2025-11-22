import api from './api';

// ====================================================================
// خدمات الدفع (Payment Services)
// ====================================================================

/**
 * إنشاء نية دفع (Payment Intent) مع بوابة الدفع (Mock/Stripe/PayPal).
 * هذا يتم بعد إنشاء الطلب (Order) في الـ Backend.
 * @param {object} data - يحتوي على order_id, payment_method, amount.
 */
export const createPaymentIntentApi = (data) => api.post('/payments/create-intent', data);

/**
 * تأكيد الدفع بعد عودة المستخدم من بوابة الدفع.
 * في الإنتاج، يتم هذا غالباً عبر Webhook، لكن هذا المسار لسيناريوهات الواجهة.
 * @param {object} data - يحتوي على payment_intent_id (transaction_id).
 */
export const confirmPaymentApi = (data) => api.post('/payments/confirm', data);