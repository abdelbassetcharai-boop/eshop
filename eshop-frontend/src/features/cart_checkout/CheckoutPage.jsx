import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { useSystem } from '../../context/SystemContext';
import { orderApi } from '../../api/orderApi';
import api from '../../api/api';
import AddressSelection from './AddressSelection';
import OrderSummary from './OrderSummary';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StripePayment from './StripePayment';
import { toast } from 'react-toastify';
import { CreditCard, Truck, Banknote } from 'lucide-react';
import { motion } from 'framer-motion';

const CheckoutPage = () => {
  const { t } = useTranslation();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { config } = useSystem();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');

  useEffect(() => {
    if (config?.paymentMethods?.cod) setPaymentMethod('cod');
    else if (config?.paymentMethods?.stripe) setPaymentMethod('credit_card');
  }, [config]);

  const [createdOrder, setCreatedOrder] = useState(null);
  const navigate = useNavigate();

  const TAX_RATE = config?.taxRate || 0.15;
  const FREE_SHIPPING_THRESHOLD = config?.freeShippingThreshold || 500;
  const STANDARD_SHIPPING_FEE = config?.shippingFee || 20;

  const tax = cartTotal * TAX_RATE;
  const shipping = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const finalTotal = cartTotal + tax + shipping;

  useEffect(() => {
    if (cartItems.length === 0 && !isProcessing && !createdOrder) {
      navigate('/cart');
    }
  }, [cartItems.length, navigate, isProcessing, createdOrder]);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error(t('checkout.select_address_error'));
      return;
    }
    if (!paymentMethod) {
      toast.error('يرجى اختيار طريقة الدفع');
      return;
    }

    setIsProcessing(true);
    try {
      const orderData = {
        orderItems: cartItems,
        shippingAddressId: selectedAddressId,
        totalAmount: finalTotal,
      };
      const orderRes = await orderApi.createOrder(orderData);

      if (orderRes.success) {
        if (paymentMethod === 'cod') {
            await confirmOrder(orderRes.data.id, 'cod', null);
        } else {
            setCreatedOrder(orderRes.data);
            setIsProcessing(false);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.error || t('common.error'));
      setIsProcessing(false);
    }
  };

  const confirmOrder = async (orderId, method, paymentIntentId) => {
      try {
          await api.post('/payments/confirm', { orderId, paymentMethod: method, paymentIntentId });
          await clearCart();
          toast.success(t('checkout.order_success'));
          navigate('/orders');
      } catch (error) {
          toast.error('فشل تأكيد الدفع.');
          setIsProcessing(false);
      }
  };

  const onStripeSuccess = async (paymentIntentId) => {
      await confirmOrder(createdOrder.id, 'stripe', paymentIntentId);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t('checkout.title') || 'Checkout'}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
        <div className="lg:col-span-2 space-y-8">
          {createdOrder && paymentMethod === 'credit_card' ? (
             <Card className="shadow-lg border-primary-500 border-2">
                <h2 className="text-xl font-bold mb-4 text-center">إكمال الدفع</h2>
                <StripePayment orderId={createdOrder.id} onPaymentSuccess={onStripeSuccess} />
             </Card>
          ) : (
            <>
              <AddressSelection selectedId={selectedAddressId} onSelect={setSelectedAddressId} />

              <Card className="shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-4 border-b pb-4">
                    <Truck className="h-6 w-6 text-secondary-600" /> {t('checkout.shipping_method')}
                </h2>
                <div className="p-4 border bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-800">الشحن القياسي (التكلفة: {config?.currency?.symbol}{STANDARD_SHIPPING_FEE})</p>
                </div>
              </Card>

              <Card className="shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-6 border-b pb-4">
                <CreditCard className="h-6 w-6 text-primary-600" /> {t('checkout.payment_method')}
                </h2>

                <div className="space-y-4">
                    {config?.paymentMethods?.cod && (
                        <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-green-600 bg-green-50 ring-1 ring-green-500' : 'border-gray-200'}`}>
                            <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="text-green-600 focus:ring-green-500 h-4 w-4" />
                            <span className="mx-3 font-medium">الدفع عند الاستلام</span>
                            <Banknote className="ml-auto h-5 w-5 text-gray-400" />
                        </label>
                    )}

                    {config?.paymentMethods?.stripe && (
                        <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'credit_card' ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200'}`}>
                            <input type="radio" name="payment" value="credit_card" checked={paymentMethod === 'credit_card'} onChange={() => setPaymentMethod('credit_card')} className="text-primary-600 focus:ring-primary-500 h-4 w-4" />
                            <span className="mx-3 font-medium">بطاقة ائتمان (Stripe)</span>
                            <CreditCard className="ml-auto h-5 w-5 text-gray-400" />
                        </label>
                    )}
                </div>
              </Card>

              <Button size="lg" variant="gradient" className="w-full mt-6 shadow-xl" onClick={handlePlaceOrder} isLoading={isProcessing} disabled={!selectedAddressId}>
                {paymentMethod === 'credit_card' ? 'الانتقال للدفع' : `${t('checkout.confirm_order')} (${config?.currency?.symbol}${finalTotal.toFixed(2)})`}
              </Button>
            </>
          )}
        </div>
        <div className="lg:col-span-1">
          <OrderSummary isCheckout={true} />
        </div>
      </div>
    </motion.div>
  );
};

export default CheckoutPage;