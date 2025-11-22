import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSystem } from '../../context/SystemContext';
import { useAuth } from '../../context/AuthContext';
import { addToCartApi } from '../../api/orderApi'; // لخدمة إضافة المنتج للعربة
import Button from '../../components/ui/Button';
// تم حذف استيراد FaStar و FaShoppingCart واستبدالها بـ SVG المضمنة

/**
 * أيقونة السلة (SVG مضمن)
 */
const IconShoppingCart = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M1 1.75A.75.75 0 011.75 1h1.628a1.75 1.75 0 011.734 1.51L5.81 8.25H18.25a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75H6.612L5.438 17.584A1.75 1.75 0 013.628 19H2.75a.75.75 0 010-1.5h.878a.25.25 0 00.244-.214L5.16 9.75H18.25a.25.25 0 00.244-.214L18.84 8.25a.75.75 0 00-.734-.99H5.81L5.112 3.26A.25.25 0 004.866 3H1.75A.75.75 0 011 2.25v-.5zm15.75 9.75a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75H6.612L5.438 17.584A1.75 1.75 0 013.628 19H2.75a.75.75 0 010-1.5h.878a.25.25 0 00.244-.214L5.16 9.75H18.25a.25.25 0 00.244-.214L18.84 8.25a.75.75 0 00-.734-.99H5.81L5.112 3.26A.25.25 0 004.866 3H1.75A.75.75 0 011 2.25v-.5z" />
  </svg>
);

/**
 * مكون لعرض النجوم (Stars) بناءً على التقييم
 */
const RatingStars = ({ rating }) => {
  const roundedRating = Math.round(parseFloat(rating));
  const stars = Array(5).fill(0).map((_, index) => (
    <svg
      key={index}
      className={`w-4 h-4 transition duration-200 ${index < roundedRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-500'}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.05 7.927c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
    </svg>
  ));
  return <div className="flex items-center space-x-0.5" style={{ direction: 'ltr' }}>{stars}</div>;
};


/**
 * مكون بطاقة المنتج (Product Card)
 * @param {object} product - بيانات المنتج.
 */
const ProductCard = ({ product }) => {
  const { config } = useSystem();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setMessage({ type: 'error', text: 'يرجى تسجيل الدخول أولاً لإضافة منتجات إلى السلة.' });
      return;
    }
    if (isOutOfStock) return;

    setLoading(true);
    setMessage(null);
    try {
      // إضافة كمية واحدة افتراضياً
      await addToCartApi({ product_id: product.id, quantity: 1 });
      setMessage({ type: 'success', text: 'تمت الإضافة بنجاح!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'فشل الإضافة إلى السلة.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]" style={{ direction: 'rtl', fontFamily: 'var(--font-family)' }}>

      {/* رسالة حالة عائمة */}
      {message && (
        <div className={`absolute top-0 right-0 left-0 p-2 text-center text-sm font-semibold transition-opacity duration-300
          ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
        >
          {message.text}
        </div>
      )}

      {/* صورة المنتج */}
      <NavLink to={`/products/${product.id}`} className="block relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img
          src={product.image_url || 'https://placehold.co/400x400/3B82F6/FFFFFF?text=Product'}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 hover:scale-110 ${isOutOfStock ? 'opacity-50' : ''}`}
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400/3B82F6/FFFFFF?text=No+Image'; }}
        />
        {isOutOfStock && (
            <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-md">نفد المخزون</span>
        )}
      </NavLink>

      <div className="p-4 space-y-3">
        {/* اسم المنتج والفئة */}
        <div className="min-h-[4rem]">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{product.category_name}</span>
            <NavLink to={`/products/${product.id}`} className="block text-lg font-bold text-gray-900 dark:text-gray-100 hover:text-[var(--primary-color)] transition duration-150 line-clamp-2">
            {product.name}
            </NavLink>
        </div>

        {/* التقييمات */}
        <div className="flex justify-between items-center text-sm">
            <RatingStars rating={product.average_rating} />
            <span className="text-gray-500 dark:text-gray-400">({product.review_count || 0} تقييم)</span>
        </div>

        {/* السعر وزر الإضافة */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
          <span className="text-2xl font-extrabold text-gray-900 dark:text-gray-50" style={{ color: 'var(--secondary-color)' }}>
            {product.price} {config.default_currency || 'SAR'}
          </span>

          <Button
            variant="primary"
            onClick={handleAddToCart}
            isLoading={loading}
            disabled={isOutOfStock}
            className="text-sm px-3 py-2 shadow-lg"
          >
            <IconShoppingCart className="w-4 h-4" />
            <span>{isOutOfStock ? 'غير متاح' : 'أضف للسلة'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;