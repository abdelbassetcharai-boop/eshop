import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
// تم تصحيح المسار: الخروج من products ثم features والدخول إلى api
import { getProductByIdApi, addReviewApi } from '../../api/productApi';
import { addToCartApi } from '../../api/orderApi';
// تم تصحيح المسار: الخروج من products ثم features والدخول إلى context
import { useSystem } from '../../context/SystemContext';
import { useAuth } from '../../context/AuthContext';
// تم تصحيح المسار: الخروج من products ثم features والدخول إلى components
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/ui/Button';
// المسار صحيح: في نفس المجلد
import ReviewForm from './ReviewForm';

// أيقونات SVG المضمنة
const IconShoppingCart = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M1 1.75A.75.75 0 011.75 1h1.628a1.75 1.75 0 011.734 1.51L5.81 8.25H18.25a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75H6.612L5.438 17.584A1.75 1.75 0 013.628 19H2.75a.75.75 0 010-1.5h.878a.25.25 0 00.244-.214L5.16 9.75H18.25a.25.25 0 00.244-.214L18.84 8.25a.75.75 0 00-.734-.99H5.81L5.112 3.26A.25.25 0 004.866 3H1.75A.75.75 0 011 2.25v-.5zm15.75 9.75a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75H6.612L5.438 17.584A1.75 1.75 0 013.628 19H2.75a.75.75 0 010-1.5h.878a.25.25 0 00.244-.214L5.16 9.75H18.25a.25.25 0 00.244-.214L18.84 8.25a.75.75 0 00-.734-.99H5.81L5.112 3.26A.25.25 0 004.866 3H1.75A.75.75 0 011 2.25v-.5z" />
  </svg>
);

const IconStar = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.05 7.927c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
  </svg>
);

const RatingStars = ({ rating, className = '' }) => {
  const roundedRating = Math.round(parseFloat(rating));
  const stars = Array(5).fill(0).map((_, index) => (
    <IconStar
      key={index}
      className={`w-5 h-5 transition duration-200 ${className} ${index < roundedRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
    />
  ));
  return <div className="flex items-center space-x-0.5" style={{ direction: 'ltr' }}>{stars}</div>;
};

/**
 * مكون صفحة تفاصيل المنتج (Product Detail Page)
 */
const ProductDetail = () => {
  const { id } = useParams();
  const { config } = useSystem();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState(null);

  // 1. جلب بيانات المنتج والمراجعات
  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProductByIdApi(id);
      setProduct(response.product);
    } catch (err) {
      setError(err.message || 'فشل جلب تفاصيل المنتج.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // 2. معالجة إضافة المنتج للعربة
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setCartMessage({ type: 'error', text: 'يرجى تسجيل الدخول أولاً.' });
      return;
    }
    if (product.stock < quantity) {
        setCartMessage({ type: 'error', text: 'الكمية المطلوبة غير متوفرة في المخزون.' });
        return;
    }

    setAddToCartLoading(true);
    setCartMessage(null);

    try {
      await addToCartApi({ product_id: product.id, quantity });
      setCartMessage({ type: 'success', text: `${quantity} وحدات أضيفت للسلة بنجاح!` });
    } catch (err) {
      setCartMessage({ type: 'error', text: err.message || 'فشل الإضافة إلى السلة.' });
    } finally {
      setAddToCartLoading(false);
    }
  };

  const isOutOfStock = product?.stock <= 0;

  // 3. عرض حالات التحميل والخطأ
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center p-10 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-xl border border-red-300 mt-8">
        <h2 className="text-xl font-bold mb-2">عفواً، حدث خطأ.</h2>
        <p>{error}</p>
        <NavLink to="/shop" className="block mt-4 text-sm font-semibold text-gray-700 hover:underline">العودة إلى المنتجات</NavLink>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center p-10">المنتج غير موجود.</div>;
  }

  // 4. التصميم والتخطيط
  return (
    <div style={{ direction: 'rtl', fontFamily: 'var(--font-family)' }} className="mt-8">

      {/* العنوان الأساسي */}
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-6" style={{ color: 'var(--secondary-color)' }}>
        {product.name}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* العمود الأيسر (الصور والوصف) - يأخذ ثلثي المساحة */}
        <div className="lg:col-span-2 space-y-12">

          {/* قسم الصورة الرئيسية */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden p-6 border border-gray-100 dark:border-gray-700">
            <img
              src={product.image_url || 'https://placehold.co/800x600/059669/FFFFFF?text=Product+Image'}
              alt={product.name}
              className="w-full h-auto object-cover rounded-lg"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/800x600/059669/FFFFFF?text=No+Image'; }}
            />
          </div>

          {/* قسم الوصف التفصيلي */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 border-b pb-2" style={{ color: 'var(--primary-color)' }}>
              وصف المنتج
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {product.description || 'لا يوجد وصف تفصيلي لهذا المنتج حالياً.'}
            </p>
          </div>

          {/* قسم المراجعات والتقييمات */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 border-b pb-2" style={{ color: 'var(--primary-color)' }}>
              تقييمات العملاء ({product.review_count})
            </h2>

            {/* نموذج إضافة تقييم */}
            <ReviewForm productId={product.id} onReviewSubmitted={fetchProduct} />

            {/* قائمة المراجعات */}
            <div className="space-y-6 pt-4">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map(review => (
                  <div key={review.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-800 dark:text-gray-100">{review.user_name}</div>
                      <RatingStars rating={review.rating} className="w-4 h-4" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{review.comment}</p>
                    <span className="block mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(review.created_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center p-4 border border-dashed rounded-xl">
                  كن أول من يقيّم هذا المنتج!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* العمود الأيمن (ملخص الشراء و CTA) - يأخذ ثلث المساحة */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 space-y-6">

            {/* حالة التقييم والسعر */}
            <div>
              <div className="flex items-center space-x-2 space-x-reverse mb-2">
                <RatingStars rating={product.average_rating} className="w-6 h-6" />
                <span className="text-gray-600 dark:text-gray-300 font-medium">({product.review_count} تقييم)</span>
              </div>
              <p className="text-4xl font-extrabold text-gray-900 dark:text-gray-50" style={{ color: 'var(--primary-color)' }}>
                {product.price} {config.default_currency || 'SAR'}
              </p>
            </div>

            {/* حالة المخزون */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className={`font-bold text-lg ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
                    {isOutOfStock ? 'نفد المخزون' : `متوفر في المخزون (${product.stock} وحدة)`}
                </p>
            </div>

            {/* التحكم في الكمية */}
            <div className="flex items-center space-x-4 space-x-reverse border-t border-gray-200 dark:border-gray-700 pt-4">
              <label className="font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">الكمية:</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={product.stock}
                disabled={isOutOfStock}
                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center"
                style={{ borderRadius: 'var(--border-radius)' }}
              />
            </div>

            {/* زر الإضافة للسلة */}
            {cartMessage && (
              <div className={`p-3 rounded-lg font-medium text-sm ${cartMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {cartMessage.text}
              </div>
            )}
            <Button
              variant="primary"
              onClick={handleAddToCart}
              isLoading={addToCartLoading}
              disabled={isOutOfStock || addToCartLoading || quantity > product.stock}
              className="w-full text-lg py-3 shadow-xl"
            >
              <IconShoppingCart className="w-5 h-5 ml-2" />
              <span>{isOutOfStock ? 'غير متاح حالياً' : 'أضف إلى السلة'}</span>
            </Button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;