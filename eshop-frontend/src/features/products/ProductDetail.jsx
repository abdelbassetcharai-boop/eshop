import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ReviewForm from './ReviewForm';
import { Star, Minus, Plus, ShoppingCart, PlayCircle, Image as ImageIcon } from 'lucide-react';

const ProductDetail = ({ product, reviews, onReviewAdded }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  // حالة لتحديد الوسائط المعروضة حالياً (صورة أو فيديو)
  // النوع: { type: 'image' | 'video', url: string }
  const [activeMedia, setActiveMedia] = useState(null);

  // --- إعداد روابط الصور والفيديو ---
  const API_BASE_URL = 'http://localhost:5000';

  const getUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url.startsWith('/') ? url : '/' + url}`;
  };

  // تهيئة الوسائط عند تحميل المنتج
  useEffect(() => {
    if (product) {
      // تعيين الصورة الرئيسية كافتراضي
      setActiveMedia({
        type: 'image',
        url: getUrl(product.image_url) || 'https://via.placeholder.com/600'
      });
    }
  }, [product]);

  const handleQuantityChange = (amount) => {
    const newQty = quantity + amount;
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty);
    }
  };

  if (!activeMedia) return null;

  // تجميع كل الصور في مصفوفة واحدة للمصغرات
  const allImages = [
    product.image_url,
    ...(product.images || [])
  ].filter(Boolean);

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">

        {/* --- قسم المعرض (الصور والفيديو) --- */}
        <div className="space-y-4">

          {/* 1. العرض الرئيسي (Main View) */}
          <div className="relative aspect-square md:aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            {activeMedia.type === 'video' ? (
              <video
                src={activeMedia.url}
                controls
                autoPlay
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <img
                src={activeMedia.url}
                alt={product.name}
                className="w-full h-full object-contain object-center"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/600?text=No+Image'; }}
              />
            )}
          </div>

          {/* 2. شريط المصغرات (Thumbnails) */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {/* مصغرات الصور */}
            {allImages.map((img, index) => {
              const fullUrl = getUrl(img);
              return (
                <button
                  key={`img-${index}`}
                  onClick={() => setActiveMedia({ type: 'image', url: fullUrl })}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                    activeMedia.url === fullUrl && activeMedia.type === 'image'
                      ? 'border-indigo-600 ring-2 ring-indigo-100'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={fullUrl} className="w-full h-full object-cover" alt="" />
                </button>
              );
            })}

            {/* مصغر الفيديو (إذا وجد) */}
            {product.video_url && (
              <button
                onClick={() => setActiveMedia({ type: 'video', url: getUrl(product.video_url) })}
                className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 flex items-center justify-center bg-gray-900 ${
                  activeMedia.type === 'video'
                    ? 'border-indigo-600 ring-2 ring-indigo-100'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <PlayCircle className="text-white w-8 h-8" />
              </button>
            )}
          </div>
        </div>

        {/* --- معلومات المنتج (لم تتغير) --- */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

          <div className="flex items-center mb-4">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < 4 ? 'fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-500">({reviews.length} تقييم)</span>
          </div>

          <div className="text-2xl font-bold text-indigo-600 mb-6">
            ${Number(product.price).toFixed(2)}
          </div>

          <div className="prose prose-sm text-gray-500 mb-8 flex-grow">
            <p>{product.description}</p>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">الكمية:</span>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 font-medium text-gray-900">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-gray-700">الحالة:</span>
              {product.stock > 0 ? (
                <Badge variant="success">متوفر ({product.stock} قطعة)</Badge>
              ) : (
                <Badge variant="danger">نفذت الكمية</Badge>
              )}
            </div>

            <Button
              size="lg"
              className="w-full flex items-center justify-center gap-2"
              disabled={product.stock === 0}
              onClick={() => addToCart(product.id, quantity)}
            >
              <ShoppingCart className="h-5 w-5" />
              إضافة إلى السلة
            </Button>
          </div>
        </div>
      </div>

      {/* قسم التقييمات (لم يتغير) */}
      <div className="border-t border-gray-200 p-8 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">التقييمات والمراجعات</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-gray-500 italic">لا توجد تقييمات بعد. كن أول من يقيم هذا المنتج!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{review.user_name}</span>
                    <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex text-yellow-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm">{review.comment}</p>
                </div>
              ))
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">أضف تقييمك</h3>
            <ReviewForm productId={product.id} onReviewAdded={onReviewAdded} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;