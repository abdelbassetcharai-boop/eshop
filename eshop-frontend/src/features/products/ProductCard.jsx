import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Button from '../../components/ui/Button';
import { ShoppingCart } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  // معالجة رابط الصورة لتوافقه مع الباك إند
  const imageUrl = product.image_url
    ? (product.image_url.startsWith('http')
        ? product.image_url
        : `${import.meta.env.VITE_API_URL.replace('/api', '')}${product.image_url}`)
    : 'https://via.placeholder.com/300';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full group">
      <div className="relative aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover object-center group-hover:scale-105 transition-transform duration-300"
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