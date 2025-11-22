import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
// تم تصحيح المسار: الخروج من cart_checkout ثم features والدخول إلى context
import { useSystem } from '../../context/SystemContext';
// تم تصحيح المسار: الخروج من cart_checkout ثم features والدخول إلى api
import { getCartApi, updateCartItemApi, removeFromCartApi, clearCartApi } from '../../api/orderApi';
// تم تصحيح المسار: الخروج من cart_checkout ثم features والدخول إلى components
import LoadingSpinner from '../../components/LoadingSpinner';
// تم تصحيح المسار: الخروج من cart_checkout ثم features والدخول إلى components/ui
import Button from '../../components/ui/Button';

// أيقونات SVG المضمنة
const IconTrash = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8.75 1a.75.75 0 00-.75.75V3H6a1.5 1.5 0 00-1.5 1.5v.75a.75.75 0 001.5 0v-.75a.5.5 0 01.5-.5h.25v10.5a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75V3h.25a.5.5 0 01.5.5v.75a.75.75 0 001.5 0v-.75A1.5 1.5 0 0014 3H11V1.75a.75.75 0 00-.75-.75h-2.5zm-.5 3a.5.5 0 01.5-.5h2.5a.5.5 0 01.5.5v10.5a.5.5 0 01-.5.5h-2.5a.5.5 0 01-.5-.5V4zM8 8.5a.5.5 0 01.5-.5h.5a.5.5 0 010 1h-.5a.5.5 0 01-.5-.5zm4 0a.5.5 0 01.5-.5h.5a.5.5 0 010 1h-.5a.5.5 0 01-.5-.5z" clipRule="evenodd" />
  </svg>
);

const IconPlus = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);

const IconMinus = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M4.75 9.25a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H4.75z" />
  </svg>
);


/**
 * مكون صفحة سلة التسوق (Cart Page)
 */
const CartPage = () => {
  const navigate = useNavigate();
  const { config } = useSystem();

  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({ total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // 1. جلب محتويات السلة
  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCartApi();
      setCartItems(response.cart || []);
      setCartSummary({
        total: parseFloat(response.total || 0),
        itemCount: parseInt(response.itemCount || 0),
      });
    } catch (err) {
      setError(err.message || 'فشل جلب محتويات السلة.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // 2. تحديث كمية عنصر في السلة
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    // التحديث المحلي الفوري لـ UX أفضل
    setCartItems(prev => prev.map(item =>
      item.cart_id === itemId ? { ...item, quantity: newQuantity } : item
    ));

    try {
      // إرسال التحديث إلى الـ Backend
      await updateCartItemApi(itemId, { quantity: newQuantity });
      fetchCart(); // إعادة جلب البيانات لتحديث الإجمالي
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'فشل تحديث الكمية.' });
      fetchCart(); // التراجع عن التغيير في الواجهة
    }
  };

  // 3. إزالة عنصر من السلة
  const removeItem = async (itemId) => {
    try {
      await removeFromCartApi(itemId);
      setMessage({ type: 'success', text: 'تم حذف العنصر من السلة.' });
      fetchCart();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'فشل حذف العنصر.' });
    }
  };

  // 4. تفريغ السلة بالكامل
  const clearCart = async () => {
    // يجب استخدام Modal أو Dialog مخصص بدلاً من window.confirm
    if (!window.confirm('هل أنت متأكد من تفريغ سلة التسوق بالكامل؟')) return;

    try {
      await clearCartApi();
      setMessage({ type: 'success', text: 'تم تفريغ السلة بنجاح.' });
      fetchCart();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'فشل تفريغ السلة.' });
    }
  };

  // 5. الانتقال لصفحة الدفع
  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center p-10 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-xl border border-red-300 mt-8">
        <h2 className="text-xl font-bold mb-2">عفواً، حدث خطأ أثناء جلب السلة.</h2>
        <p>{error}</p>
      </div>
    );
  }

  const currency = config.default_currency || 'SAR';
  const isCartEmpty = cartItems.length === 0;

  return (
    <div style={{ direction: 'rtl', fontFamily: 'var(--font-family)' }} className="mt-6">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-8" style={{ color: 'var(--primary-color)' }}>
        سلة التسوق
      </h1>

      {/* رسالة حالة (نجاح / خطأ) */}
      {message && (
        <div
          className={`p-4 mb-6 rounded-xl font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}
        >
          {message.text}
        </div>
      )}

      {isCartEmpty ? (
        <div className="text-center p-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-6">سلة التسوق فارغة حالياً.</p>
          <NavLink to="/shop">
            <Button variant="primary">ابدأ التسوق الآن</Button>
          </NavLink>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* العمود 1: قائمة العناصر */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">العناصر ({cartSummary.itemCount})</h2>
                <Button variant="ghost" onClick={clearCart} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50">
                    <IconTrash className="w-5 h-5 ml-1" />
                    تفريغ السلة
                </Button>
            </div>

            {cartItems.map(item => (
              <div key={item.cart_id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg flex items-center space-x-4 space-x-reverse transition-shadow duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700">

                {/* صورة المنتج */}
                <NavLink to={`/products/${item.product_id}`} className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={item.image_url || 'https://placehold.co/100x100/3B82F6/FFFFFF?text=Product'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </NavLink>

                {/* التفاصيل */}
                <div className="flex-grow">
                  <NavLink to={`/products/${item.product_id}`} className="text-lg font-bold text-gray-900 dark:text-gray-100 hover:text-[var(--primary-color)] transition line-clamp-1">
                    {item.name}
                  </NavLink>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    سعر الوحدة: {item.price} {currency}
                  </p>
                  {item.stock < item.quantity && (
                    <p className="text-xs text-red-500 font-semibold mt-1">! الكمية المطلوبة غير متوفرة حالياً</p>
                  )}
                </div>

                {/* التحكم بالكمية */}
                <div className="flex items-center space-x-2 space-x-reverse border border-gray-300 dark:border-gray-600 rounded-full p-1">
                  <button
                    onClick={() => updateQuantity(item.cart_id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="p-1 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition"
                  >
                    <IconMinus className="w-4 h-4" />
                  </button>
                  <span className="font-semibold w-6 text-center text-gray-800 dark:text-gray-200">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cart_id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="p-1 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition"
                  >
                    <IconPlus className="w-4 h-4" />
                  </button>
                </div>

                {/* السعر الفرعي والحذف */}
                <div className="flex flex-col items-end min-w-[6rem]">
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {parseFloat(item.total_price).toFixed(2)} {currency}
                    </span>
                    <button
                        onClick={() => removeItem(item.cart_id)}
                        className="mt-2 text-red-500 hover:text-red-700 transition p-1"
                    >
                        <IconTrash className="w-4 h-4" />
                    </button>
                </div>
              </div>
            ))}
          </div>

          {/* العمود 2: ملخص الطلب */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 space-y-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 border-b pb-3">ملخص الطلب</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>الإجمالي الفرعي:</span>
                  <span className="font-semibold">{cartSummary.total.toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300 border-b pb-3">
                  <span>الشحن المقدر:</span>
                  <span className="font-semibold">سيتم حسابه لاحقاً</span>
                </div>
                <div className="flex justify-between text-2xl font-extrabold text-gray-900 dark:text-gray-50" style={{ color: 'var(--primary-color)' }}>
                  <span>الإجمالي الكلي:</span>
                  <span>{cartSummary.total.toFixed(2)} {currency}</span>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleCheckout}
                className="w-full text-lg py-3 shadow-xl"
              >
                المتابعة للدفع
              </Button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;