import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { orderApi } from '../../api/orderApi';
import { paymentApi } from '../../api/paymentApi';
import AddressSelection from './AddressSelection';
import OrderSummary from './OrderSummary';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { toast } from 'react-toastify';
import { CreditCard, Truck, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const CheckoutPage = () => {
  const { t } = useTranslation();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod: Cash On Delivery
  const navigate = useNavigate();

  // منطق الحسابات المالية (يجب أن يطابق OrderSummary والباك إند)
  const TAX_RATE = 0.15;
  const FREE_SHIPPING_THRESHOLD = 100;
  const STANDARD_SHIPPING_FEE = 10;

  const tax = cartTotal * TAX_RATE;
  const shipping = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const finalTotal = cartTotal + tax + shipping;

  // التحقق من السلة قبل البدء
  useEffect(() => {
    if (cartItems.length === 0 && !isProcessing) {
      navigate('/cart');
      toast.warn(t('cart.empty_title'));
    }
  }, [cartItems.length, navigate, isProcessing, t]);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error(t('checkout.select_address_error') || 'Please select a shipping address');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. إنشاء الطلب في الباك إند
      const orderData = {
        orderItems: cartItems,
        shippingAddressId: selectedAddressId,
        totalAmount: finalTotal, // نرسل الإجمالي المحسوب
        // لا نحتاج لإرسال طريقة الدفع هنا، بل نرسلها في خطوة الدفع
      };

      const orderRes = await orderApi.createOrder(orderData);

      if (orderRes.success) {
        const orderId = orderRes.data.id;

        // 2. معالجة الدفع (التواصل مع PaymentController.js)
        await paymentApi.processPayment({
          orderId,
          paymentMethod,
          amount: finalTotal,
          // إذا كان دفع إلكتروني، سنرسل token/transactionId هنا
        });

        // 3. تنظيف السلة وتوجيه المستخدم
        await clearCart();
        toast.success(t('checkout.order_success') || 'Order placed successfully! Thank you for your purchase.');
        navigate('/orders');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || t('common.error'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {t('checkout.title') || 'Checkout'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">

        <div className="lg:col-span-2 space-y-8">

          {/* قسم اختيار العنوان */}
          <AddressSelection
            selectedId={selectedAddressId}
            onSelect={setSelectedAddressId}
          />

          {/* قسم طرق الشحن (مبسط) */}
          <Card className="shadow-lg">
             <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                <Truck className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
                {t('checkout.shipping_method') || 'Shipping Method'}
             </h2>
             <div className="p-4 border border-secondary-200 dark:border-secondary-900/50 bg-secondary-50 dark:bg-secondary-900/10 rounded-xl">
               <p className="text-sm text-secondary-800 dark:text-secondary-400">
                  {t('checkout.shipping_note') || 'Standard shipping will be applied based on your total amount.'}
               </p>
             </div>
          </Card>

          {/* قسم الدفع */}
          <Card className="shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
              <CreditCard className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              {t('checkout.payment_method') || 'Payment Method'}
            </h2>

            <div className="space-y-4">
               {/* خيار الدفع عند الاستلام */}
               <div
                   onClick={() => setPaymentMethod('cod')}
                   className={`p-4 border rounded-xl cursor-pointer transition-colors duration-200 ${
                       paymentMethod === 'cod'
                       ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500'
                       : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-primary-700 bg-white dark:bg-dark-card'
                   }`}
               >
                  <label className="flex items-center space-x-3 rtl:space-x-reverse font-medium text-gray-900 dark:text-white cursor-pointer">
                      <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          readOnly
                          className="text-primary-600 focus:ring-primary-500 h-4 w-4 border-gray-300 dark:bg-gray-800"
                      />
                      <span>{t('checkout.cod') || 'Cash On Delivery'}</span>
                  </label>
               </div>

               {/* خيار الدفع بالبطاقة (محاكاة) */}
               <div
                   onClick={() => setPaymentMethod('credit_card')}
                   className={`p-4 border rounded-xl cursor-pointer transition-colors duration-200 ${
                       paymentMethod === 'credit_card'
                       ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500'
                       : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-primary-700 bg-white dark:bg-dark-card'
                   }`}
               >
                  <label className="flex items-center space-x-3 rtl:space-x-reverse font-medium text-gray-900 dark:text-white cursor-pointer">
                      <input
                          type="radio"
                          name="payment"
                          value="credit_card"
                          checked={paymentMethod === 'credit_card'}
                          readOnly
                          className="text-primary-600 focus:ring-primary-500 h-4 w-4 border-gray-300 dark:bg-gray-800"
                      />
                      <span>{t('checkout.credit_card') || 'Credit/Debit Card (Mock Payment)'}</span>
                  </label>
               </div>
            </div>
          </Card>

          {/* زر تأكيد الطلب */}
          <Button
            size="lg"
            variant="gradient"
            className="w-full mt-6 shadow-xl shadow-primary-500/20"
            onClick={handlePlaceOrder}
            isLoading={isProcessing}
            disabled={!selectedAddressId}
          >
            {t('checkout.confirm_order') || 'Confirm Order'} ({t('common.currency')}{finalTotal.toFixed(2)})
          </Button>

          {!selectedAddressId && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-400 flex items-center gap-2 text-sm">
                <AlertTriangle className='h-4 w-4' />
                {t('checkout.select_address_error')}
            </div>
          )}

        </div>

        {/* ملخص الطلب (Sticky) */}
        <div className="lg:col-span-1">
          <OrderSummary isCheckout={true} />
        </div>
      </div>
    </motion.div>
  );
};

export default CheckoutPage;