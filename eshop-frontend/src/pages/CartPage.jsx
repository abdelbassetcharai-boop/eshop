import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import CartItem from '../features/cart_checkout/CartItem';
import OrderSummary from '../features/cart_checkout/OrderSummary';
import Button from '../components/ui/Button';
import { ArrowRight, ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CartPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const { cartItems, clearCart, loading } = useCart();

  if (loading) {
    return <div className="text-center py-20">{t('common.loading')}</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6"
        >
          <ShoppingBag className="h-10 w-10 text-gray-400 dark:text-gray-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t('cart.empty_title') || 'Your cart is empty'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
          {t('cart.empty_msg') || 'Looks like you have not added anything to your cart. Go ahead and explore top categories.'}
        </p>
        <Link to="/shop">
          <Button size="lg" variant="primary" className="shadow-lg shadow-primary-500/20">
            {t('hero.cta') || 'Start Shopping'}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {t('nav.cart')} <span className="text-gray-400 text-xl font-normal">({cartItems.length})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
        {/* قائمة المنتجات */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                layout
              >
                <CartItem item={item} />
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
            <Link
              to="/shop"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-2 font-medium transition-colors"
            >
              {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
              {t('cart.continue_shopping') || 'Continue Shopping'}
            </Link>

            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              {t('cart.clear_cart') || 'Clear Cart'}
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