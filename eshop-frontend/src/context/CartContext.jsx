import { createContext, useState, useEffect, useContext } from 'react';
import { cartApi } from '../api/cartApi';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // تحميل السلة عند تسجيل الدخول
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCartItems([]);
      setCartTotal(0);
    }
  }, [isAuthenticated]);

  // حساب مجموع السلة كلما تغيرت العناصر
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => {
      return sum + (Number(item.price) * item.quantity);
    }, 0);
    setCartTotal(total);
  }, [cartItems]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await cartApi.getCart();
      if (res.success) {
        setCartItems(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch cart', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('الرجاء تسجيل الدخول لإضافة منتجات للسلة');
      return false;
    }

    try {
      const res = await cartApi.addToCart(productId, quantity);
      if (res.success) {
        toast.success('تمت الإضافة للسلة 🛒');
        await fetchCart(); // إعادة تحميل السلة لتحديث البيانات
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل إضافة المنتج');
      return false;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await cartApi.removeFromCart(itemId);
      if (res.success) {
        setCartItems(items => items.filter(item => item.id !== itemId));
        toast.success('تم حذف المنتج');
      }
    } catch (error) {
      toast.error('فشل حذف المنتج');
    }
  };

  const clearCart = async () => {
    try {
      const res = await cartApi.clearCart();
      if (res.success) {
        setCartItems([]);
        toast.info('تم إفراغ السلة');
      }
    } catch (error) {
      toast.error('فشل إفراغ السلة');
    }
  };

  const value = {
    cartItems,
    cartTotal,
    loading,
    addToCart,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;