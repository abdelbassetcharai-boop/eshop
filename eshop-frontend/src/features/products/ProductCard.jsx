import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { ShoppingCart, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();

  // 1. معالجة رابط الصورة
  const API_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

  const getImageUrl = (url) => {
    if (!url) return 'https://placehold.co/400x400/E5E7EB/4B5563?text=No+Image';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url.startsWith('/') ? url : '/' + url}`;
  };

  const imageUrl = getImageUrl(product.image_url);
  const priceSymbol = t('common.currency') || '$';
  const isOutOfStock = product.stock === 0;

  // افتراض تقييم (حيث أن الباك إند لا يوفر متوسط التقييم مباشرة في القائمة)
  const rating = product.average_rating || 4;

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
      className="bg-white dark:bg-dark-card rounded-2xl shadow-md overflow-hidden transition-all duration-300 flex flex-col h-full group border border-gray-100 dark:border-gray-800"
    >
      {/* قسم الصورة */}
      <Link to={`/products/${product.id}`} className="relative aspect-square w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
        {isOutOfStock && (
            <Badge variant="danger" className="absolute top-3 right-3 z-10 animate-pulse">
                {t('product.out_of_stock')}
            </Badge>
        )}
        <img
          src={imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
          onError={(e) => { e.target.src = 'https://placehold.co/400x400/E5E7EB/4B5563?text=No+Image'; }}
        />
      </Link>

      {/* قسم التفاصيل */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
            {/* التقييم */}
            <div className="flex items-center text-yellow-500 dark:text-yellow-400">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                ))}
            </div>
            {/* الفئة (افتراضي) */}
            <span className="text-xs text-gray-500 dark:text-gray-400 italic">{product.category_name || t('product.unknown')}</span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate group-hover:text-primary-600 transition-colors">
          <Link to={`/products/${product.id}`}>
            {product.name}
          </Link>
        </h3>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-grow">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">
            {priceSymbol}{Number(product.price).toFixed(2)}
          </span>

          <Button
            size="sm"
            variant="gradient"
            onClick={() => addToCart(product.id)}
            disabled={isOutOfStock}
            className={`flex items-center gap-1 shadow-md transition-all ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'shadow-secondary-500/30'}`}
          >
            <ShoppingCart className="h-4 w-4" />
            {t('product.add_to_cart')}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;