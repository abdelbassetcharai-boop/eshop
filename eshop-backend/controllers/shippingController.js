const { pool } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get active shipping methods
// @route   GET /api/shipping/methods
// @access  Public
exports.getShippingMethods = asyncHandler(async (req, res, next) => {
  // نفترض وجود جدول 'shipping_methods' يحتوي على الأعمدة: id, name, price, estimated_days, is_active
  // إذا لم يكن الجدول موجوداً، يجب إنشاؤه أو تعديل هذا الاستعلام ليعيد بيانات ثابتة مؤقتاً

  // استعلام لجلب الطرق النشطة فقط
  const result = await pool.query('SELECT * FROM shipping_methods WHERE is_active = true ORDER BY price ASC');

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});

/* ملاحظة: إذا لم يكن لديك جدول shipping_methods في قاعدة البيانات الحالية
يمكنك استخدام هذا الكود البديل مؤقتاً لضمان عمل الفرونت إند:

exports.getShippingMethods = asyncHandler(async (req, res, next) => {
  const mockMethods = [
    { id: 1, name: 'Standard Shipping', price: 0.00, estimated_days: '5-7 business days' },
    { id: 2, name: 'Express Shipping', price: 15.00, estimated_days: '2-3 business days' }
  ];

  res.status(200).json({
    success: true,
    count: mockMethods.length,
    data: mockMethods
  });
});
*/