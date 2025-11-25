import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useTranslation } from 'react-i18next';

const OrderSummary = ({ isCheckout = false }) => {
  const { t } = useTranslation();
  const { cartTotal } = useCart();
  const currencySymbol = t('common.currency') || '$';

  // منطق الحسابات المالية (يجب أن يطابق الباك إند)
  const TAX_RATE = 0.15; // 15% ضريبة
  const FREE_SHIPPING_THRESHOLD = 100;
  const STANDARD_SHIPPING_FEE = 10;

  const tax = cartTotal * TAX_RATE;
  const shipping = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const total = cartTotal + tax + shipping;

  return (
    <Card className="shadow-lg sticky top-24 transform transition-all duration-300">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-3">
        {t('cart.summary_title') || 'Order Summary'}
      </h2>

      <div className="flow-root">
        <dl className="space-y-4 text-sm">
          {/* المجموع الفرعي */}
          <div className="flex items-center justify-between">
            <dt className="text-gray-600 dark:text-gray-300">
              {t('cart.subtotal') || 'Subtotal'}
            </dt>
            <dd className="font-medium text-gray-900 dark:text-white">
              {currencySymbol}{cartTotal.toFixed(2)}
            </dd>
          </div>

          {/* الشحن */}
          <div className="flex items-center justify-between">
            <dt className="text-gray-600 dark:text-gray-300">
              {t('cart.shipping') || 'Shipping'}
            </dt>
            <dd className="font-medium text-gray-900 dark:text-white">
              {shipping === 0
                ? <span className="text-green-500">{t('cart.free') || 'Free'}</span>
                : `${currencySymbol}${shipping.toFixed(2)}`}
            </dd>
          </div>

          {/* الضريبة */}
          <div className="flex items-center justify-between">
            <dt className="text-gray-600 dark:text-gray-300">
              {t('cart.tax') || 'Tax'} ({`${(TAX_RATE * 100).toFixed(0)}%`})
            </dt>
            <dd className="font-medium text-gray-900 dark:text-white">
              {currencySymbol}{tax.toFixed(2)}
            </dd>
          </div>

          {/* الإجمالي الكلي */}
          <div className="py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 mt-4">
            <dt className="text-lg font-bold text-gray-900 dark:text-white">
              {t('cart.total') || 'Total'}
            </dt>
            <dd className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {currencySymbol}{total.toFixed(2)}
            </dd>
          </div>
        </dl>
      </div>

      {!isCheckout && (
        <div className="mt-6">
          <Link to="/checkout">
            <Button size="lg" variant="gradient" className="w-full shadow-lg shadow-secondary-500/30">
              {t('cart.proceed_to_checkout') || 'Proceed to Checkout'}
            </Button>
          </Link>
        </div>
      )}

      {isCheckout && (
        <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
            {t('cart.checkout_note') || 'By placing an order, you agree to the terms and conditions.'}
        </p>
      )}
    </Card>
  );
};

export default OrderSummary;