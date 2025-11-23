import React from 'react';
import { useCart } from '../../context/CartContext';
import { Trash2, Plus, Minus } from 'lucide-react';

const CartItem = ({ item }) => {
  const { addToCart, removeFromCart } = useCart();

  // معالجة رابط الصورة
  const imageUrl = item.image_url
    ? (item.image_url.startsWith('http')
        ? item.image_url
        : `${import.meta.env.VITE_API_URL.replace('/api', '')}${item.image_url}`)
    : 'https://via.placeholder.com/150';

  const handleQuantityChange = (amount) => {
    if (item.quantity + amount > 0) {
      // نرسل الفرق (+1 أو -1) ليتم معالجته في الباك إند كـ addToCart
      addToCart(item.product_id, amount);
    }
  };

  return (
    <div className="flex items-center p-4 bg-white shadow-sm rounded-lg border border-gray-200">
      {/* صورة المنتج */}
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <img
          src={imageUrl}
          alt={item.name}
          className="h-full w-full object-cover object-center"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
        />
      </div>

      {/* التفاصيل */}
      <div className="ml-4 flex-1 flex flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <h3>{item.name}</h3>
            <p className="ml-4">${(Number(item.price) * item.quantity).toFixed(2)}</p>
          </div>
          <p className="mt-1 text-sm text-gray-500">سعر الوحدة: ${Number(item.price).toFixed(2)}</p>
        </div>

        <div className="flex-1 flex items-end justify-between text-sm">
          {/* التحكم بالكمية */}
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="p-1 hover:bg-gray-100 text-gray-600 disabled:opacity-50"
              disabled={item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-3 font-medium text-gray-900">{item.quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="p-1 hover:bg-gray-100 text-gray-600"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => removeFromCart(item.id)}
            className="font-medium text-red-600 hover:text-red-500 flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            حذف
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;