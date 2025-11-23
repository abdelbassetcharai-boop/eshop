import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ReviewForm from './ReviewForm';
import { Star, Minus, Plus, ShoppingCart } from 'lucide-react';

const ProductDetail = ({ product, reviews, onReviewAdded }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  // معالجة رابط الصورة
  const imageUrl = product.image_url
    ? (product.image_url.startsWith('http')
        ? product.image_url
        : `${import.meta.env.VITE_API_URL.replace('/api', '')}${product.image_url}`)
    : 'https://via.placeholder.com/600';

  const handleQuantityChange = (amount) => {
    const newQty = quantity + amount;
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">

        {/* معرض الصور */}
        <div className="aspect-w-4 aspect-h-3 bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover object-center"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/600?text=No+Image'; }}
          />
        </div>

        {/* معلومات المنتج */}
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

      {/* قسم التقييمات */}
      <div className="border-t border-gray-200 p-8 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">التقييمات والمراجعات</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* قائمة التقييمات */}
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

          {/* نموذج إضافة تقييم */}
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