import React, { createContext, useState, useEffect, useContext } from 'react';
import { cartApi } from '../api/cartApi';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // محاولة استعادة السلة من LocalStorage للمستخدمين غير المسجلين (مستقبلاً)
    // حالياً نعتمد على الباك إند للمسجلين
    return [];
  });
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // دالة مساعدة لحساب المجموع
  const calculateTotal = (items) => {
    return items.reduce((sum, item) => {
      return sum + (Number(item.price) * item.quantity);
    }, 0);
  };

  // تحميل السلة عند تسجيل الدخول
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCartItems([]);
      setCartTotal(0);
    }
  }, [isAuthenticated]);

  // تحديث المجموع عند تغير العناصر
  useEffect(() => {
    setCartTotal(calculateTotal(cartItems));
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
      toast.warn('يجب تسجيل الدخول لإضافة منتجات للسلة');
      // مستقبلاً: يمكن إضافة منطق تخزين محلي هنا لغير المسجلين
      return false;
    }

    // تحديث متفائل (Optimistic UI Update)
    // نفترض النجاح ونحدث الواجهة فوراً لجعل التجربة أسرع
    // لكن هنا سنلتزم بالطريقة الآمنة (انتظار السيرفر) لضمان دقة المخزون

    try {
      const res = await cartApi.addToCart(productId, quantity);
      if (res.success) {
        toast.success('تمت الإضافة للسلة 🛒', {
            position: "bottom-left",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
        await fetchCart();
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل إضافة المنتج');
      return false;
    }
  };

  const removeFromCart = async (itemId) => {
    // تحديث متفائل: نحذف العنصر من الواجهة فوراً
    const originalItems = [...cartItems];
    setCartItems(items => items.filter(item => item.id !== itemId));

    try {
      const res = await cartApi.removeFromCart(itemId);
      if (res.success) {
        toast.success('تم حذف المنتج', { autoClose: 1500 });
      } else {
        // في حال الفشل، نعيد العنصر
        setCartItems(originalItems);
      }
    } catch (error) {
      setCartItems(originalItems);
      toast.error('فشل حذف المنتج');
    }
  };

  const clearCart = async () => {
    const originalItems = [...cartItems];
    setCartItems([]); // تفريغ فوري

    try {
      const res = await cartApi.clearCart();
      if (res.success) {
        toast.info('تم إفراغ السلة');
      } else {
        setCartItems(originalItems);
      }
    } catch (error) {
      setCartItems(originalItems);
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