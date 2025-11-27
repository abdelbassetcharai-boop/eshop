import React from 'react';
import { useCart } from '../../context/CartContext';
import { useSystem } from '../../context/SystemContext'; // استيراد السياق
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CartItem = ({ item }) => {
  const { t, i18n } = useTranslation();
  const { addToCart, removeFromCart } = useCart();
  const { config } = useSystem(); // الحصول على الإعدادات
  const isRTL = i18n.dir() === 'rtl';

  // العملة الديناميكية
  const priceSymbol = config?.currency?.symbol || t('common.currency') || '$';

  const API_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

  const imageUrl = item.image_url
    ? (item.image_url.startsWith('http')
        ? item.image_url
        : `${API_BASE_URL}${item.image_url.startsWith('/') ? item.image_url : '/' + item.image_url}`)
    : 'https://placehold.co/150x150/E5E7EB/4B5563?text=No+Image';

  const handleQuantityChange = (amount) => {
    if (item.quantity + amount > 0 && item.quantity + amount <= item.stock) {
      addToCart(item.product_id, amount);
    } else if (item.quantity + amount > item.stock) {
        toast.warn(t('cart.stock_limit_reached') || 'Stock limit reached for this product.');
    }
  };

  const itemTotal = Number(item.price) * item.quantity;

  return (
    <div className="flex items-center p-4 sm:p-6 bg-white dark:bg-dark-card shadow-lg rounded-xl border border-gray-100 dark:border-gray-800 transition-shadow">

      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <Link to={`/products/${item.product_id}`}>
          <img
            src={imageUrl}
            alt={item.name}
            className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
            onError={(e) => { e.target.src = 'https://placehold.co/150x150?text=No+Image'; }}
          />
        </Link>
      </div>

      <div className="ml-4 rtl:mr-4 flex-1 flex flex-col justify-between h-full">
        <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white mb-2">
          <h3 className="truncate max-w-[200px] sm:max-w-none">
            <Link to={`/products/${item.product_id}`} className="hover:text-primary-600 transition-colors">
                {item.name}
            </Link>
          </h3>
          <p className="ml-4 font-bold text-lg text-primary-600 dark:text-primary-400">
            {priceSymbol}{itemTotal.toFixed(2)}
          </p>
        </div>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('product.unit_price') || 'Unit Price'}: {priceSymbol}{Number(item.price).toFixed(2)}
        </p>

        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm gap-3">

          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-50"
              disabled={item.quantity <= 1}
              aria-label={t('common.decrease')}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-3 font-medium text-gray-900 dark:text-white select-none">{item.quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-50"
              disabled={item.quantity >= item.stock}
              aria-label={t('common.increase')}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => removeFromCart(item.id)}
            className="font-medium text-red-600 dark:text-red-400 hover:text-red-500 flex items-center gap-1 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            {t('common.delete') || 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;