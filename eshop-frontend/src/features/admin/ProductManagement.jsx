import React, { useState, useEffect } from 'react';
// تم تصحيح المسار: الخروج من admin ثم features والدخول إلى context
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
// *** استيراد CRUD من ProductApi وليس AdminApi ***
import {
    createProductApi,
    updateProductApi,
    deleteProductApi,
    // تم تصحيح مكان getAllCategoriesApi - يجب أن يكون هنا
    getAllCategoriesApi
} from '../../api/productApi';
// تم تصحيح المسار: الخروج من admin ثم features والدخول إلى api
import { getAllProductsAdminApi } from '../../api/adminApi';
// تم تصحيح المسار: الخروج من admin ثم features والدخول إلى components
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

// ==========================================================
// أيقونات SVG المضمنة (لتجنب أخطاء مكتبات react-icons)
// ==========================================================
const IconEdit = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M5.433 13.917V16.5a.5.5 0 00.5.5h2.583a.5.5 0 00.5-.5v-2.583a.5.5 0 00-.146-.354L7.854 11.06a.5.5 0 00-.708 0l-1.5 1.5a.5.5 0 00-.146.354zM15.815 4.315a.75.75 0 00-1.06-1.06l-6.815 6.815a.75.75 0 00-.146.354L7.5 14.5a.5.5 0 00.5.5h2.583a.5.5 0 00.5-.5v-2.583a.5.5 0 00-.146-.354l-6.815-6.815z" />
  </svg>
);
const IconTrash = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8.75 1a.75.75 0 00-.75.75V3H6a1.5 1.5 0 00-1.5 1.5v.75a.75.75 0 001.5 0v-.75a.5.5 0 01.5-.5h.25v10.5a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75V3h.25a.5.5 0 01.5.5v.75a.75.75 0 001.5 0v-.75A1.5 1.5 0 0014 3H11V1.75a.75.75 0 00-.75-.75h-2.5zm-.5 3a.5.5 0 01.5-.5h2.5a.5.5 0 01.5.5v10.5a.5.5 0 01-.5.5h-2.5a.5.5 0 01-.5-.5V4zM8 8.5a.5.5 0 01.5-.5h.5a.5.5 0 010 1h-.5a.5.5 0 01-.5-.5zm4 0a.5.5 0 01.5-.5h.5a.5.5 0 010 1h-.5a.5.5 0 01-.5-.5z" clipRule="evenodd" />
  </svg>
);
const IconPlus = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 5a.75.75 0 01.75.75v3.5h3.5a.75.75 0 010 1.5h-3.5v3.5a.75.75 0 01-1.5 0v-3.5h-3.5a.75.75 0 010-1.5h3.5v-3.5A.75.75 0 0110 5z" clipRule="evenodd" />
  </svg>
);
const IconBox = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.5 3A1.5 1.5 0 004 4.5v11A1.5 1.5 0 005.5 17h9a1.5 1.5 0 001.5-1.5v-11A1.5 1.5 0 0014.5 3h-9zM5.5 4a.5.5 0 00-.5.5v11a.5.5 0 00.5.5h9a.5.5 0 00.5-.5v-11a.5.5 0 00-.5-.5h-9zM8.5 7.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-2z" clipRule="evenodd" />
  </svg>
);
const IconToggleOn = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-5.25-4.25a.75.75 0 011.5 0V14h3.75a.75.75 0 010 1.5H6.25v.75a.75.75 0 01-1.5 0V14h-.75a.75.75 0 010-1.5h.75v-.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-6v.75a.75.75 0 01.75.75h7.5a.75.75 0 010 1.5H6.25v.75a.75.75 0 01-1.5 0V14a.75.75 0 01.75-.75h.75z" clipRule="evenodd" />
  </svg>
);
const IconToggleOff = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-5.25-4.25a.75.75 0 011.5 0V14h3.75a.75.75 0 010 1.5H6.25v.75a.75.75 0 01-1.5 0V14h-.75a.75.75 0 010-1.5h.75v-.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-6v.75a.75.75 0 01.75.75h7.5a.75.75 0 010 1.5H6.25v.75a.75.75 0 01-1.5 0V14a.75.75 0 01.75-.75h.75z" clipRule="evenodd" />
  </svg>
);


/**
 * مكون إدارة المنتجات (Product Management)
 */
const ProductManagement = () => {
  const { user } = useAuth();
  const { config } = useSystem();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, type: 'create', data: null }); // إدارة حالة الـ Modal

  // 1. جلب البيانات (المنتجات والفئات)
  const fetchProductsAndCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        getAllProductsAdminApi({}), // جلب كل المنتجات (Backend يطبق التصفية للبائع)
        getAllCategoriesApi()
      ]);

      setProducts(productsResponse.products || []);
      setCategories(categoriesResponse.data || []);
    } catch (err) {
      setError(err.message || 'فشل جلب المنتجات أو الفئات.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  // 2. معالجة الإرسال (إنشاء أو تحديث)
  const handleFormSubmit = async (formData) => {
    setMessage(null);
    try {
      if (modal.type === 'create') {
        await createProductApi(formData);
        setMessage({ type: 'success', text: 'تم إنشاء المنتج بنجاح.' });
      } else {
        await updateProductApi(modal.data.id, formData);
        setMessage({ type: 'success', text: 'تم تحديث المنتج بنجاح.' });
      }
      setModal({ isOpen: false, type: 'create', data: null });
      fetchProductsAndCategories();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'فشل في العملية.' });
    }
  };

  // 3. معالجة الحذف
  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`هل أنت متأكد من حذف المنتج: ${productName}?`)) return;
    setMessage(null);
    try {
      await deleteProductApi(productId);
      setMessage({ type: 'success', text: 'تم حذف المنتج بنجاح.' });
      fetchProductsAndCategories();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'فشل في حذف المنتج.' });
    }
  };

  // 4. معالجة تبديل حالة التفعيل
  const handleToggleActive = async (product) => {
    setMessage(null);
    try {
      await updateProductApi(product.id, { is_active: !product.is_active });
      setMessage({ type: 'success', text: `تم ${!product.is_active ? 'تفعيل' : 'إلغاء تفعيل'} المنتج بنجاح.` });
      fetchProductsAndCategories();
    } catch (err) {
        setMessage({ type: 'error', text: err.message || 'فشل في تحديث حالة التفعيل.' });
    }
  };

  const currency = config.default_currency || 'SAR';
  const isAdmin = user?.role === 'admin';
  const isVendor = user?.role === 'vendor';

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center p-10 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-xl border border-red-300 mt-8">
        <h2 className="text-xl font-bold mb-2">عفواً، حدث خطأ.</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ direction: 'rtl', fontFamily: 'var(--font-family)' }} className="mt-6">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-8" style={{ color: 'var(--primary-color)' }}>
        إدارة المنتجات
      </h1>

      {/* رسالة حالة (نجاح / خطأ) */}
      {message && (
        <div
          className={`p-4 mb-6 rounded-xl font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}
        >
          {message.text}
        </div>
      )}

      {/* شريط الإجراءات */}
      <div className="flex justify-between items-center mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {isVendor ? 'منتجاتي' : 'جميع المنتجات'} ({products.length})
        </h2>
        <Button
          variant="primary"
          onClick={() => setModal({ isOpen: true, type: 'create', data: null })}
        >
          <IconPlus className="w-4 h-4 ml-2" />
          إضافة منتج جديد
        </Button>
      </div>

      {/* جدول المنتجات */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">اسم المنتج</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">الفئة</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">السعر</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">المخزون</th>
                {isAdmin && <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">البائع</th>}
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">نشط</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center">
                    <IconBox className="w-4 h-4 ml-2 text-gray-500" />
                    <NavLink to={`/products/${product.id}`} className="hover:text-blue-500 transition">
                        {product.name}
                    </NavLink>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {product.category_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {parseFloat(product.price).toFixed(2)} {currency}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                    <span className={product.stock === 0 ? 'text-red-500' : 'text-green-600'}>
                        {product.stock}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {product.vendor_name || 'N/A'}
                    </td>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button onClick={() => handleToggleActive(product)} className="focus:outline-none">
                        {product.is_active ? (
                            <IconToggleOn className="w-6 h-6 text-green-500 hover:text-green-600" />
                        ) : (
                            <IconToggleOff className="w-6 h-6 text-gray-400 hover:text-gray-500" />
                        )}
                    </button>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2 space-x-reverse">
                    <Button
                        variant="ghost"
                        onClick={() => setModal({ isOpen: true, type: 'edit', data: product })}
                        className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/50"
                    >
                        <IconEdit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => handleDelete(product.id, product.name)}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50"
                    >
                        <IconTrash className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal للإضافة/التعديل */}
      {modal.isOpen && (
        <ProductFormModal
          modal={modal}
          categories={categories}
          onSubmit={handleFormSubmit}
          onClose={() => setModal({ isOpen: false, type: 'create', data: null })}
        />
      )}
    </div>
  );
};

// ==========================================================
// مكون Modal لنموذج الإضافة/التعديل
// ==========================================================
const ProductFormModal = ({ modal, categories, onSubmit, onClose }) => {
    const isEditing = modal.type === 'edit';
    const initialData = modal.data || {};
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || '',
        stock: initialData.stock || 0,
        category_id: initialData.category_id || (categories[0]?.id || ''),
        image_url: initialData.image_url || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
    });
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // محاكاة بسيطة للتحقق من Frontend قبل إرسال الـ Backend
    const validateForm = () => {
        const errors = {};
        if (!formData.name) errors.name = 'الاسم مطلوب.';
        if (!formData.price || isNaN(formData.price) || formData.price <= 0) errors.price = 'السعر غير صحيح.';
        if (!formData.category_id) errors.category_id = 'الفئة مطلوبة.';
        if (formData.stock < 0) errors.stock = 'المخزون يجب أن يكون موجباً.';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        // في حالة التعديل، نرسل فقط الحقول التي تم تغييرها (لتحسين الأداء)
        const dataToSend = isEditing ?
            Object.keys(formData).reduce((acc, key) => {
                if (formData[key] !== initialData[key]) {
                    acc[key] = formData[key];
                }
                return acc;
            }, {})
            : formData;

        onSubmit(dataToSend);
        setLoading(false);
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40 p-4 transition-opacity duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl shadow-3xl overflow-y-auto max-h-[90vh]">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {isEditing ? `تعديل المنتج: ${initialData.name}` : 'إضافة منتج جديد'}
                        </h2>
                        <button onClick={onClose} type="button" className="text-gray-500 hover:text-red-500 transition">
                            <IconTrash className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6 space-y-4 grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* العمود 1 */}
                        <div className="space-y-4">
                            <Input name="name" label="اسم المنتج" value={formData.name} onChange={handleChange} error={formErrors.name} required />

                            <Input
                                name="price"
                                label={`السعر (${'SAR'})`}
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                error={formErrors.price}
                                required
                                step="0.01"
                            />

                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">الفئة</label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    className="shadow-sm border border-gray-300 dark:border-gray-600 rounded-xl w-full py-3 px-4 text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition"
                                    style={{ borderRadius: 'var(--border-radius)' }}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {formErrors.category_id && <p className="mt-1 text-sm text-red-500 font-medium">{formErrors.category_id}</p>}
                            </div>

                             <Input
                                name="stock"
                                label="كمية المخزون"
                                type="number"
                                value={formData.stock}
                                onChange={handleChange}
                                error={formErrors.stock}
                                required
                                min="0"
                            />

                             <label className="flex items-center space-x-2 space-x-reverse text-sm font-semibold text-gray-700 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-[var(--primary-color)] border-gray-300 rounded focus:ring-[var(--primary-color)]"
                                />
                                <span>المنتج نشط ومتاح للعرض</span>
                            </label>
                        </div>

                        {/* العمود 2 */}
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">الوصف</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="الوصف التفصيلي للمنتج"
                                rows="6"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl transition shadow-sm text-gray-800 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                                style={{ borderRadius: 'var(--border-radius)' }}
                            />

                            <Input name="image_url" label="رابط الصورة" value={formData.image_url} onChange={handleChange} placeholder="https://..." />

                            {/* معاينة الصورة */}
                            {formData.image_url && (
                                <img src={formData.image_url} alt="معاينة" className="w-full h-32 object-contain rounded-lg border border-dashed border-gray-300 p-2" />
                            )}
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>إلغاء</Button>
                        <Button type="submit" variant="primary" isLoading={loading}>
                            {isEditing ? 'حفظ التعديلات' : 'إضافة المنتج'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductManagement;