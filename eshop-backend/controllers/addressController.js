const { pool } = require('../config/database');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all user addresses
exports.getAddresses = asyncHandler(async (req, res, next) => {
  const query = 'SELECT * FROM user_addresses WHERE user_id = $1 ORDER BY created_at DESC';
  const result = await pool.query(query, [req.user.id]);

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows,
  });
});

// @desc    Add new address
exports.addAddress = asyncHandler(async (req, res, next) => {
  // نستخرج البيانات من جسم الطلب
  const { title, address_line1, address_line2, city, postal_code, country, phone } = req.body;

  // التحقق من الحقول الأساسية
  if (!address_line1 || !city || !phone) {
    return next(new ErrorResponse('Please provide address, city and phone', 400));
  }

  const query = `
    INSERT INTO user_addresses (user_id, title, address, address_line2, city, postal_code, country, phone)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

  // ملاحظة: قمت بتعديل اسم العمود في الاستعلام ليتوافق مع ما تم إرساله من الفرونت (address بدل address_line1 في بعض النسخ)
  // ولكن الأدق هو استخدام الأسماء كما هي في قاعدة البيانات.
  // في قاعدة بياناتك: الأعمدة هي (user_id, title, address, city, phone) - لاحظ "address" وليس "address_line1"

  // تصحيح الاستعلام بناءً على قاعدة بياناتك الفعلية (eshop_database):
  // الأعمدة الموجودة: id, user_id, title, address, city, phone, created_at
  // لا يوجد address_line2 ولا postal_code ولا country في الجدول الأصلي الذي أرسلته،
  // لذا سأقوم بدمج المعلومات الإضافية في حقل العنوان أو تجاهلها لتجنب الخطأ،
  // أو الأفضل: إضافة الأعمدة الناقصة إذا كنت تريدها.

  // الحل الآمن حالياً (استخدام الأعمدة الموجودة فقط):
  const safeQuery = `
    INSERT INTO user_addresses (user_id, title, address, city, phone)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  // دمج التفاصيل الإضافية في حقل العنوان إذا لم تكن الأعمدة موجودة
  const fullAddress = `${address_line1} ${address_line2 ? '- ' + address_line2 : ''} ${postal_code ? '- ' + postal_code : ''} ${country ? '- ' + country : ''}`;

  const values = [req.user.id, title || 'Home', fullAddress, city, phone];
  const result = await pool.query(safeQuery, values);

  res.status(201).json({
    success: true,
    data: result.rows[0],
  });
});

// ... (بقية الدوال updateAddress و deleteAddress تبقى كما هي) ...
exports.updateAddress = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { title, address_line1, city, phone } = req.body;

    const check = await pool.query('SELECT * FROM user_addresses WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (check.rows.length === 0) return next(new ErrorResponse('Address not found', 404));

    const query = `
      UPDATE user_addresses
      SET title = COALESCE($1, title),
          address = COALESCE($2, address),
          city = COALESCE($3, city),
          phone = COALESCE($4, phone)
      WHERE id = $5
      RETURNING *
    `;
    const values = [title, address_line1, city, phone, id]; // address_line1 سيتم تخزينه في عمود address
    const result = await pool.query(query, values);

    res.status(200).json({ success: true, data: result.rows[0] });
});

exports.deleteAddress = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const check = await pool.query('SELECT * FROM user_addresses WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (check.rows.length === 0) return next(new ErrorResponse('Address not found', 404));
    await pool.query('DELETE FROM user_addresses WHERE id = $1', [id]);
    res.status(200).json({ success: true, data: {}, message: 'Address removed' });
});