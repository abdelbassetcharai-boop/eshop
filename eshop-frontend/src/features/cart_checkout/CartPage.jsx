import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CartItem from './CartItem';
import OrderSummary from './OrderSummary';
import Button from '../../components/ui/Button';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

const CartPage = () => {
  const { cartItems, clearCart, loading } = useCart();

  if (loading) {
    return <div className="text-center py-20">جاري تحميل السلة...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">سلة التسوق فارغة</h2>
        <p className="text-gray-500 mb-8">يبدو أنك لم تضف أي منتجات بعد.</p>
        <Link to="/shop">
          <Button size="lg">ابدأ التسوق الآن</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">سلة التسوق</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* قائمة المنتجات */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}

          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
            <Link to="/shop" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              متابعة التسوق
            </Link>
            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              إفراغ السلة
            </button>
          </div>
        </div>

        {/* ملخص الطلب */}
        <div className="lg:col-span-1">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
};

export default CartPage;