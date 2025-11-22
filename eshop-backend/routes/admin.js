const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  updateUserRole,
  getAllOrders,
  updateOrderStatus,
  getAllProductsAdmin
} = require('../controllers/adminController');

// متحكمات الإعدادات الديناميكية
const {
  updateConfigs,
  updateTheme,
  updatePageLayout,
  addShippingZone
} = require('../controllers/adminSystemController');

// متحكمات CRUD الجديدة
const {
  categoryController,
  shippingZoneController,
  bannerController,
  flashSaleController,
  uiTranslationController
} = require('../controllers/adminDataController');

const auth = require('../middleware/auth');
const { adminAuth, vendorAuth } = require('../middleware/adminAuth');

// ********** تصحيح الاستيراد **********
const validate = require('../middleware/validationMiddleware');
// يجب أن يكون الاستيراد هكذا لضمان الوصول إلى adminSchemas
const { adminSchemas } = require('../validation/schemas');
// ************************************

// حماية جميع المسارات
router.use(auth);

// **********************************************
// مسارات المشرف (Admin Only)
// **********************************************
router.use(adminAuth);

// --- 1. الإحصائيات والأوامر العامة (AdminController) ---
router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/products', getAllProductsAdmin);

// --- 2. إدارة النظام الديناميكي (AdminSystemController) ---
// ملاحظة: تم تعديل هذه المسارات لتتوافق مع مخططات adminSchemas
router.put('/system/configs', validate(adminSchemas.config), updateConfigs);
router.put('/system/theme', validate(adminSchemas.theme), updateTheme);
router.put('/system/layout', updatePageLayout);

// --- 3. إدارة الفئات (Categories CRUD) ---
router.get('/categories', categoryController.getAll);
router.post('/categories', validate(adminSchemas.category), categoryController.create);
router.put('/categories/:id', validate(adminSchemas.category), categoryController.update);
router.delete('/categories/:id', categoryController.delete);

// --- 4. إدارة مناطق الشحن (Shipping Zones CRUD) ---
router.get('/shipping-zones', shippingZoneController.getAll);
router.post('/shipping-zones', validate(adminSchemas.shippingZone), shippingZoneController.create);
// تنبيه: تم تصحيح الخطأ المحتمل هنا. يجب أن يكون المتحكم shippingZoneController وليس shippingController
router.put('/shipping-zones/:id', validate(adminSchemas.shippingZone), shippingZoneController.update);
router.delete('/shipping-zones/:id', shippingZoneController.delete);

// --- 5. إدارة البنرات (Banners CRUD) ---
router.get('/banners', bannerController.getAll);
router.post('/banners', validate(adminSchemas.banner), bannerController.create);
router.put('/banners/:id', validate(adminSchemas.banner), bannerController.update);
router.delete('/banners/:id', bannerController.delete);

// --- 6. إدارة الترجمة (Translations CRUD) ---
router.get('/translations', uiTranslationController.getAll);
router.post('/translations', validate(adminSchemas.translation), uiTranslationController.create);
// التحديث يعتمد على :key بدلاً من :id
router.put('/translations/:key', validate(adminSchemas.translation), uiTranslationController.update);
router.delete('/translations/:key', uiTranslationController.delete);

// --- 7. إدارة العروض المؤقتة (Flash Sales CRUD) ---
router.get('/flash-sales', flashSaleController.getAll);
router.post('/flash-sales', validate(adminSchemas.flashSale), flashSaleController.create);
router.put('/flash-sales/:id', validate(adminSchemas.flashSale), flashSaleController.update);
router.delete('/flash-sales/:id', flashSaleController.delete);


// **********************************************
// مسارات المشرف والبائع (Admin / Vendor)
// **********************************************

// الطلبات (محدثة لتشمل تصفية البائعين)
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus); // تحديث حالة الطلب

module.exports = router;