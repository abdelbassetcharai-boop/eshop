import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Button from '../../components/ui/Button';
import { ShoppingCart } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  // --- إصلاح رابط الصورة (نفس المنطق المستخدم في ProductDetail) ---
  // 1. تحديد رابط السيرفر الأساسي
  const API_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

  // 2. دالة لمعالجة رابط الصورة
  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/300'; // صورة احتياطية
    if (url.startsWith('http')) return url; // رابط خارجي جاهز
    return `${API_BASE_URL}${url}`; // رابط محلي: نضيف له عنوان السيرفر
  };

  const imageUrl = getImageUrl(product.image_url);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full group">
      {/* استخدام aspect-square لضمان أبعاد صحيحة للصورة */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-200">
        <img
          src={imageUrl}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
        />
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 truncate">
          <Link to={`/products/${product.id}`} className="hover:text-indigo-600 transition-colors">
            {product.name}
          </Link>
        </h3>

        <p className="mt-1 text-sm text-gray-500 line-clamp-2 flex-grow">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-indigo-600">
            ${Number(product.price).toFixed(2)}
          </span>

          <Button
            size="sm"
            onClick={() => addToCart(product.id)}
            className="flex items-center gap-1"
          >
            <ShoppingCart className="h-4 w-4" />
            إضافة
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;