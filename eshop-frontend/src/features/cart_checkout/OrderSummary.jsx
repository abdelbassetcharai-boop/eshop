import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Button from '../../components/ui/Button';

const OrderSummary = ({ isCheckout = false }) => {
  const { cartTotal } = useCart();

  const tax = cartTotal * 0.15; // ضريبة افتراضية 15%
  const shipping = cartTotal > 100 ? 0 : 10; // شحن مجاني فوق 100 دولار
  const total = cartTotal + tax + shipping;

  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 sticky top-24">
      <h2 className="text-lg font-medium text-gray-900 mb-4">ملخص الطلب</h2>

      <div className="flow-root">
        <dl className="-my-4 text-sm divide-y divide-gray-200">
          <div className="py-4 flex items-center justify-between">
            <dt className="text-gray-600">المجموع الفرعي</dt>
            <dd className="font-medium text-gray-900">${cartTotal.toFixed(2)}</dd>
          </div>
          <div className="py-4 flex items-center justify-between">
            <dt className="text-gray-600">الشحن</dt>
            <dd className="font-medium text-gray-900">
              {shipping === 0 ? 'مجاني' : `$${shipping.toFixed(2)}`}
            </dd>
          </div>
          <div className="py-4 flex items-center justify-between">
            <dt className="text-gray-600">الضريبة (15%)</dt>
            <dd className="font-medium text-gray-900">${tax.toFixed(2)}</dd>
          </div>
          <div className="py-4 flex items-center justify-between border-t border-gray-200">
            <dt className="text-base font-bold text-gray-900">الإجمالي</dt>
            <dd className="text-base font-bold text-indigo-600">${total.toFixed(2)}</dd>
          </div>
        </dl>
      </div>

      {!isCheckout && (
        <div className="mt-6">
          <Link to="/checkout">
            <Button size="lg" className="w-full">
              متابعة للدفع
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;