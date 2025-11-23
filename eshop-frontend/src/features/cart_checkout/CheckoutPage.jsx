import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { orderApi } from '../../api/orderApi';
import { paymentApi } from '../../api/paymentApi';
import AddressSelection from './AddressSelection';
import OrderSummary from './OrderSummary';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';
import { CreditCard } from 'lucide-react';

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const tax = cartTotal * 0.15;
  const shipping = cartTotal > 100 ? 0 : 10;
  const finalTotal = cartTotal + tax + shipping;

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('الرجاء اختيار عنوان الشحن');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. إنشاء الطلب في الباك إند
      const orderData = {
        orderItems: cartItems,
        shippingAddressId: selectedAddressId,
        totalAmount: finalTotal
      };

      const orderRes = await orderApi.createOrder(orderData);

      if (orderRes.success) {
        const orderId = orderRes.data.id;

        // 2. معالجة الدفع (محاكاة)
        await paymentApi.processPayment({
          orderId,
          paymentMethod: 'credit_card',
          amount: finalTotal
        });

        // 3. تنظيف السلة وتوجيه المستخدم
        await clearCart();
        toast.success('تم الطلب بنجاح! شكراً لشرائك.');
        navigate('/orders');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشلت عملية الطلب');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">إتمام الشراء</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* قسم اختيار العنوان */}
          <AddressSelection
            selectedId={selectedAddressId}
            onSelect={setSelectedAddressId}
          />

          {/* قسم الدفع (مبسط) */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-600" />
              طريقة الدفع
            </h2>
            <div className="p-4 border border-indigo-200 bg-indigo-50 rounded-md">
              <p className="text-sm text-indigo-700">
                سيتم خصم المبلغ من بطاقتك الائتمانية المحفوظة (محاكاة).
              </p>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full mt-6"
            onClick={handlePlaceOrder}
            isLoading={isProcessing}
          >
            تأكيد الطلب (${finalTotal.toFixed(2)})
          </Button>
        </div>

        <div className="lg:col-span-1">
          <OrderSummary isCheckout={true} />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;