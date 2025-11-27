import React, { useState, useEffect, useCallback, useRef  } from 'react';
import { useCart } from '../../context/CartContext';
import { useSystem } from '../../context/SystemContext'; // استيراد السياق
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ReviewForm from './ReviewForm';
import Card from '../../components/ui/Card';
import { Star, Minus, Plus, ShoppingCart, PlayCircle, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

const ProductDetail = ({ product, reviews, onReviewAdded }) => {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const { config } = useSystem(); // الحصول على الإعدادات
  const [quantity, setQuantity] = useState(1);
  const [activeMedia, setActiveMedia] = useState(null);

  const detailsRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

  const getUrl = (url) => {
    if (!url) return 'https://placehold.co/600x400/E5E7EB/4B5563?text=No+Image';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url.startsWith('/') ? url : '/' + url}`;
  };

  // العملة الديناميكية
  const currencySymbol = config?.currency?.symbol || t('common.currency') || '$';

  const allImages = [
    product.image_url,
    ...(product.images || [])
  ].filter(Boolean);

  useEffect(() => {
    if (product) {
      const defaultUrl = getUrl(product.image_url) || getUrl('https://placehold.co/600x400');
      setActiveMedia({
        type: 'image',
        url: defaultUrl
      });
    }
  }, [product]);

  useEffect(() => {
    if (detailsRef.current) {
      gsap.from(detailsRef.current.children, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power1.out',
        delay: 0.2
      });
    }
  }, [product]);

  const handleQuantityChange = (amount) => {
    const newQty = quantity + amount;
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
    : 0;

  if (!activeMedia) return null;

  const handleReviewAdded = () => {
    if (onReviewAdded) {
        onReviewAdded(product.id);
    }
  };

  return (
    <Card className="shadow-lg p-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">

        <div className="space-y-4">
          <motion.div
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.4 }}
             className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {activeMedia.type === 'video' ? (
              <video
                key={activeMedia.url}
                src={activeMedia.url}
                controls
                autoPlay
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <img
                key={activeMedia.url}
                src={activeMedia.url}
                alt={product.name}
                className="w-full h-full object-contain object-center transition-opacity duration-300"
                onError={(e) => { e.target.src = getUrl('https://placehold.co/600x400?text=Error'); }}
              />
            )}

            {product.vendor_name && (
              <Badge variant="default" className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3">
                {t('vendor.sold_by') || 'Sold by'}: {product.vendor_name}
              </Badge>
            )}
          </motion.div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {allImages.map((img, index) => {
              const fullUrl = getUrl(img);
              return (
                <button
                  key={`img-${index}`}
                  onClick={() => setActiveMedia({ type: 'image', url: fullUrl })}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                    activeMedia.url === fullUrl && activeMedia.type === 'image'
                      ? 'border-primary-600 dark:border-primary-400 ring-2 ring-primary-100'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  title={t('product.image') || 'Image'}
                >
                  <img src={fullUrl} className="w-full h-full object-cover" alt="" />
                </button>
              );
            })}

            {product.video_url && (
              <button
                onClick={() => setActiveMedia({ type: 'video', url: getUrl(product.video_url) })}
                className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 flex items-center justify-center bg-gray-900 transition-colors ${
                  activeMedia.type === 'video'
                    ? 'border-primary-600 dark:border-primary-400 ring-2 ring-primary-100'
                    : 'border-transparent hover:border-gray-600'
                }`}
                title={t('product.video_preview') || 'Video Preview'}
              >
                <PlayCircle className="text-white w-8 h-8 opacity-75" />
              </button>
            )}
          </div>
        </div>

        <div ref={detailsRef} className="flex flex-col space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-snug">{product.name}</h1>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="flex text-yellow-500 dark:text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < Math.round(averageRating) ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
              ))}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({reviews.length} {t('product.reviews')})
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-bold">
              {averageRating.toFixed(1)} / 5
            </span>
          </div>

          <div className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">
            {currencySymbol} {Number(product.price).toFixed(2)}
          </div>

          <div className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-full">
            <p>{product.description}</p>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('common.qty') || 'Quantity'}:
              </span>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-50 transition-colors"
                  disabled={quantity <= 1}
                  aria-label={t('common.decrease')}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 font-medium text-gray-900 dark:text-white select-none">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-50 transition-colors"
                  disabled={quantity >= product.stock}
                  aria-label={t('common.increase')}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('order.status')}:
              </span>
              {product.stock > 0 ? (
                <Badge variant="success">
                  {t('product.in_stock')} ({product.stock} {t('common.items')})
                </Badge>
              ) : (
                <Badge variant="danger">
                  {t('product.out_of_stock')}
                </Badge>
              )}
            </div>

            <Button
              size="lg"
              variant="gradient"
              className="w-full flex items-center justify-center gap-2 shadow-xl shadow-secondary-500/20"
              disabled={product.stock === 0}
              onClick={() => addToCart(product.id, quantity)}
            >
              <ShoppingCart className="h-5 w-5" />
              {t('product.add_to_cart')}
            </Button>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-12 border-t border-gray-100 dark:border-gray-700 pt-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary-500" />
          {t('product.reviews_and_ratings') || 'Reviews & Ratings'}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {reviews.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 italic p-4 border border-dashed rounded-xl">
                {t('product.no_reviews') || 'No reviews yet. Be the first to review this product!'}
              </p>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} className="p-4 border-l-4 border-primary-500/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{review.user_name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex text-yellow-500 dark:text-yellow-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{review.comment}</p>
                </Card>
              ))
            )}
          </div>

          <div className="lg:col-span-1">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('product.add_review') || 'Add Your Review'}
            </h3>
            <ReviewForm
              productId={product.id}
              onReviewAdded={handleReviewAdded}
            />

          </div>
        </div>
      </motion.div>
    </Card>
  );
};

export default ProductDetail;