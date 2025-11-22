import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// تم تصحيح المسار: الخروج من cart_checkout ثم features والدخول إلى context
import { useSystem } from '../../context/SystemContext';
// تم تصحيح المسار: الخروج من cart_checkout ثم features والدخول إلى api
import { getCartApi, createOrderApi } from '../../api/orderApi';
// تم تعديل المسار ليعتمد على api/paymentApi.js
// يجب إنشاء هذا الملف لاحقاً كملف API مخصص للدفع.
import { createPaymentIntentApi } from '../../api/paymentApi';
// تم تصحيح المسار: الخروج من cart_checkout ثم features والدخول إلى components
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/ui/Button';
import AddressSelection from './AddressSelection'; // المسار صحيح: في نفس المجلد

// ==========================================================
// أيقونات SVG المضمنة (لتجنب أخطاء مكتبات react-icons/fa)
// ==========================================================

const IconMapMarker = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 4.198 3.5 6.786 6 10.707 2.5-3.921 6-6.51 6-10.707a6 6 0 00-6-6zm0 14.5a.75.75 0 010-1.5 3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);

const IconCreditCard = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v.75a.75.75 0 01-1.5 0V6.5a.5.5 0 00-.5-.5h-8a.5.5 0 00-.5.5V7a.75.75 0 01-1.5 0V6zM4 9a1 1 0 00-1 1v4a1 1 0 001 1h12a1 1 0 001-1v-4a1 1 0 00-1-1H4z" />
    </svg>
);

const IconCheckCircle = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.88l-3.293 3.5a.75.75 0 00-.098.704l1.5 3a.75.75 0 101.406-.51l-1.077-2.153 2.85-3.037a.75.75 0 00.106-.88z" clipRule="evenodd" />
    </svg>
);

const IconClipboardList = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5.5 2A1.5 1.5 0 004 3.5V5h12V3.5A1.5 1.5 0 0014.5 2h-9zM4 7h12v9a1 1 0 01-1 1H5a1 1 0 01-1-1V7zM5.5 4a.5.5 0 01.5-.5h8a.5.5 0 01.5.5V5H5V4.5zM6.25 10a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5h-7.5zm0 3.5a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5h-7.5z" />
    </svg>
);

// محاكاة لخدمة الدفع (يجب إنشاءها في src/api/paymentApi.js)
// للتنفيذ، سنقوم بمحاكاة الدالة هنا مؤقتاً
const mockCreatePaymentIntentApi = (data) => {
    console.log("Mocking Payment Intent creation:", data);
    return new Promise(resolve => setTimeout(() => resolve({
        success: true,
        payment_intent: { transaction_id: 'mock_txn_12345' }
    }), 500));
};


/**
 * مكون صفحة إتمام الدفع (Checkout Page)
 * ينظم عملية الشراء في خطوات (العنوان -> الدفع -> التأكيد).
 */
const CheckoutPage = () => {
  const navigate = useNavigate();
  const { config } = useSystem();

  // 1. حالة الخطوات
  const [currentStep, setCurrentStep] = useState(1);

  // 2. حالة البيانات المجمعة
  const [cartSummary, setCartSummary] = useState({ total: 0, items: [] });
  const [addressData, setAddressData] = useState(null);
  const [shippingCost, setShippingCost] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash_on_delivery');

  // 3. حالة التحميل والخطأ
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [finalOrder, setFinalOrder] = useState(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);


  // 1. جلب محتويات السلة أولاً
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        const response = await getCartApi();
        if (!response.cart || response.cart.length === 0) {
            setError('السلة فارغة. يرجى إضافة منتجات أولاً.');
            setLoading(false);
            return;
        }
        setCartSummary({
          total: parseFloat(response.total || 0),
          items: response.cart,
        });
      } catch (err) {
        setError(err.message || 'فشل جلب محتويات السلة.');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  // 2. دالة لإنشاء الطلب والتعامل مع الدفع (الخطوة الأخيرة)
  const handlePlaceOrder = async () => {
    if (!addressData || shippingCost === null) return;

    setIsProcessingOrder(true);
    setError(null);

    // تجميع البيانات للـ Backend
    const orderDetails = {
      shipping_address: `${addressData.address}, ${addressData.city}, الهاتف: ${addressData.phone}`,
      shipping_cost: shippingCost,
      payment_method: selectedPaymentMethod,
    };

    try {
      // أ. إنشاء الطلب في الـ Backend
      const orderResponse = await createOrderApi(orderDetails);
      const newOrder = orderResponse.order;

      // ب. التعامل مع بوابة الدفع (إذا لم تكن دفع عند الاستلام)
      if (selectedPaymentMethod !== 'cash_on_delivery') {
        const paymentIntentResponse = await mockCreatePaymentIntentApi({ // استخدام mock هنا
            order_id: newOrder.id,
            payment_method: selectedPaymentMethod,
            amount: newOrder.total_price // الإجمالي شامل الشحن
        });

        // هنا يتم توجيه المستخدم لبوابة الدفع (خارج السياق)
        console.log("Payment Intent Created:", paymentIntentResponse.payment_intent.transaction_id);

        // محاكاة تأكيد الدفع (يجب أن يتم عبر webhook في الإنتاج)
      }

      setFinalOrder(newOrder);
      setCurrentStep(4); // الانتقال لخطوة التأكيد

    } catch (err) {
      setError(err.message || 'فشل إنشاء الطلب.');
    } finally {
      setIsProcessingOrder(false);
    }
  };

  // 3. معالجة إكمال اختيار العنوان (الخطوة 1)
  const handleAddressSelectionComplete = (data) => {
    setAddressData(data.address);
    setShippingCost(data.shippingCost);
    setCurrentStep(2);
  };

  // 4. عرض حالة التحميل والخطأ العام
  if (loading || isProcessingOrder) {
    return <LoadingSpinner />;
  }

  if (error && !finalOrder) {
    return (
      <div className="text-center p-10 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-xl border border-red-300 mt-8">
        <h2 className="text-xl font-bold mb-2">عفواً، حدث خطأ.</h2>
        <p>{error}</p>
        {error.includes('السلة فارغة') && (
            <Button variant="secondary" onClick={() => navigate('/shop')} className="mt-4">العودة للتسوق</Button>
        )}
      </div>
    );
  }

  // الملخص الإجمالي
  const currency = config.default_currency || 'SAR';
  const subtotal = cartSummary.total;
  const total = subtotal + (shippingCost || 0);

  // 5. مكون شريط الخطوات
  const StepIndicator = ({ step, title, icon: Icon, isActive }) => (
    <div className={`flex items-center space-x-2 space-x-reverse ${isActive ? 'text-[var(--primary-color)] font-bold' : 'text-gray-500'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-[var(--primary-color)] bg-green-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
        {isActive ? <Icon className="w-4 h-4" /> : <span className='text-sm'>{step}</span>}
      </div>
      <span className='hidden sm:inline'>{title}</span>
    </div>
  );

  return (
    <div style={{ direction: 'rtl', fontFamily: 'var(--font-family)' }} className="mt-6">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-8" style={{ color: 'var(--secondary-color)' }}>
        إتمام الدفع
      </h1>

      {/* شريط الخطوات */}
      <div className="flex justify-between items-center mb-10 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <StepIndicator step={1} title="العنوان والشحن" icon={IconMapMarker} isActive={currentStep >= 1} />
        <div className={`flex-1 h-0.5 mx-2 transition-colors duration-500 ${currentStep >= 2 ? 'bg-[var(--primary-color)]' : 'bg-gray-300'}`}></div>
        <StepIndicator step={2} title="طريقة الدفع" icon={IconCreditCard} isActive={currentStep >= 2} />
        <div className={`flex-1 h-0.5 mx-2 transition-colors duration-500 ${currentStep >= 3 ? 'bg-[var(--primary-color)]' : 'bg-gray-300'}`}></div>
        <StepIndicator step={3} title="مراجعة الطلب" icon={IconClipboardList} isActive={currentStep >= 3} />
        <div className={`flex-1 h-0.5 mx-2 transition-colors duration-500 ${currentStep >= 4 ? 'bg-[var(--primary-color)]' : 'bg-gray-300'}`}></div>
        <StepIndicator step={4} title="التأكيد" icon={IconCheckCircle} isActive={currentStep >= 4} />
      </div>

      {/* عرض الخطوات الفعلية */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* العمود الأيسر: الخطوات */}
        <div className="lg:col-span-2">

          {/* الخطوة 1: العنوان والشحن */}
          {currentStep === 1 && (
            <AddressSelection
              cartSummary={cartSummary}
              onSelectionComplete={handleAddressSelectionComplete}
            />
          )}

          {/* الخطوة 2: اختيار طريقة الدفع */}
          {currentStep === 2 && (
            <StepTwoPayment
                selectedPaymentMethod={selectedPaymentMethod}
                setSelectedPaymentMethod={setSelectedPaymentMethod}
                onBack={() => setCurrentStep(1)}
                onContinue={() => setCurrentStep(3)}
            />
          )}

          {/* الخطوة 3: مراجعة الطلب */}
          {currentStep === 3 && (
            <StepThreeReview
                cartSummary={cartSummary}
                addressData={addressData}
                shippingCost={shippingCost}
                paymentMethod={selectedPaymentMethod}
                onBack={() => setCurrentStep(2)}
                onPlaceOrder={handlePlaceOrder}
                currency={currency}
            />
          )}

          {/* الخطوة 4: تأكيد الطلب */}
          {currentStep === 4 && finalOrder && (
            <StepFourConfirmation
                finalOrder={finalOrder}
                currency={currency}
                onNavigateHome={() => navigate('/')}
            />
          )}

        </div>

        {/* العمود الأيمن: ملخص الطلب الثابت */}
        <div className="lg:col-span-1">
          <OrderSummaryCard
            subtotal={subtotal}
            shippingCost={shippingCost}
            total={total}
            currency={currency}
            addressData={addressData}
            paymentMethod={selectedPaymentMethod}
          />
        </div>
      </div>
    </div>
  );
};

// ==========================================================
// المكونات الفرعية لصفحة Checkout (لتنظيم الكود)
// ==========================================================

// مكون ملخص الطلب الثابت (للعرض الجانبي)
const OrderSummaryCard = ({ subtotal, shippingCost, total, currency, addressData, paymentMethod }) => (
    <div className="sticky top-24 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 space-y-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 border-b pb-3">ملخص الفاتورة</h2>

        <div className="space-y-2">
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>الإجمالي الفرعي:</span>
                <span className="font-semibold">{subtotal.toFixed(2)} {currency}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>الشحن:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                    {shippingCost !== null ? `${shippingCost.toFixed(2)} ${currency}` : 'جاري الحساب...'}
                </span>
            </div>
        </div>

        <div className="flex justify-between text-2xl font-extrabold text-gray-900 dark:text-gray-50 border-t border-gray-200 dark:border-gray-700 pt-3" style={{ color: 'var(--primary-color)' }}>
            <span>الإجمالي الكلي:</span>
            <span>{total.toFixed(2)} {currency}</span>
        </div>

        {/* تفاصيل العنوان والدفع (مشروط) */}
        {addressData && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-sm">
                <p className='font-bold mb-1'>الشحن إلى:</p>
                <p className='text-gray-600 dark:text-gray-400'>{addressData.title} - {addressData.city}</p>
                <p className='mt-2 font-bold mb-1'>الدفع عبر:</p>
                <p className='text-gray-600 dark:text-gray-400 capitalize'>{paymentMethod.replace('_', ' ')}</p>
            </div>
        )}
    </div>
);

// مكون الخطوة 2: اختيار طريقة الدفع
const StepTwoPayment = ({ selectedPaymentMethod, setSelectedPaymentMethod, onBack, onContinue }) => {
    const paymentOptions = [
        { id: 'cash_on_delivery', name: 'الدفع عند الاستلام (COD)', description: 'دفع المبلغ نقداً عند استلام الطلب.' },
        { id: 'card', name: 'البطاقة الائتمانية / مدى', description: 'يتم تحويلك إلى بوابة الدفع الآمنة.' },
        { id: 'bank_transfer', name: 'التحويل البنكي', description: 'يجب إرسال إيصال التحويل لإكمال الطلب.' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 space-y-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 border-b pb-2">2. اختيار طريقة الدفع</h2>

            <div className="space-y-4">
                {paymentOptions.map(option => (
                    <div
                        key={option.id}
                        onClick={() => setSelectedPaymentMethod(option.id)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition duration-200
                          ${selectedPaymentMethod === option.id ? 'border-[var(--primary-color)] shadow-md' : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'}`}
                    >
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">{option.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                    </div>
                ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="secondary" onClick={onBack}>العودة للعنوان</Button>
                <Button variant="primary" onClick={onContinue}>المتابعة للمراجعة</Button>
            </div>
        </div>
    );
};

// مكون الخطوة 3: مراجعة الطلب
const StepThreeReview = ({ cartSummary, addressData, shippingCost, paymentMethod, onBack, onPlaceOrder, currency }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 space-y-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 border-b pb-2">3. مراجعة الطلب وتأكيده</h2>

        {/* تفاصيل الشحن */}
        <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 border-b pb-2">العنوان</h3>
            <p className='text-sm text-gray-600 dark:text-gray-300'>
                **{addressData.title}:** {addressData.address}, {addressData.city}
            </p>
            <p className='text-sm text-gray-600 dark:text-gray-300'>
                الهاتف: {addressData.phone} | الشحن: {shippingCost.toFixed(2)} {currency}
            </p>
        </div>

        {/* تفاصيل الدفع */}
        <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 border-b pb-2">الدفع</h3>
            <p className='text-sm text-gray-600 dark:text-gray-300'>
                طريقة الدفع المختارة: <span className='font-semibold capitalize'>{paymentMethod.replace('_', ' ')}</span>
            </p>
        </div>

        {/* قائمة المنتجات في الطلب */}
        <h3 className="font-bold text-gray-800 dark:text-gray-100 border-b pb-2 mt-6">المنتجات ({cartSummary.items.length} صنف)</h3>
        <ul className="space-y-3 max-h-60 overflow-y-auto">
            {cartSummary.items.map(item => (
                <li key={item.cart_id} className='flex justify-between text-sm text-gray-700 dark:text-gray-300'>
                    <span>{item.name} (x{item.quantity})</span>
                    <span>{item.total_price} {currency}</span>
                </li>
            ))}
        </ul>

        {/* أزرار التأكيد */}
        <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary" onClick={onBack}>العودة للدفع</Button>
            <Button
                variant="primary"
                onClick={onPlaceOrder}
                className="shadow-xl"
            >
                تأكيد وإنهاء الطلب
            </Button>
        </div>
    </div>
);

// مكون الخطوة 4: تأكيد الطلب
const StepFourConfirmation = ({ finalOrder, currency, onNavigateHome }) => (
    <div className="text-center p-10 bg-green-50 dark:bg-green-900/50 rounded-2xl border border-green-300 shadow-2xl space-y-6">
        <IconCheckCircle className="w-16 h-16 mx-auto text-green-600 dark:text-green-300" />
        <h2 className="text-3xl font-bold text-green-700 dark:text-green-200">تم إنشاء الطلب بنجاح!</h2>

        <p className="text-lg text-gray-700 dark:text-gray-300">
            تم استلام طلبك رقم <span className='font-extrabold'>{finalOrder.id}</span>.
        </p>

        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl inline-block">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                الإجمالي المدفوع: {finalOrder.total_price.toFixed(2)} {currency}
            </p>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
            ستصلك رسالة تأكيد بالبريد الإلكتروني قريباً.
        </p>

        <div className="flex justify-center space-x-4 space-x-reverse pt-4">
            <Button variant="secondary" onClick={() => window.open(`/orders/${finalOrder.id}`, '_blank')}>
                عرض تفاصيل الطلب
            </Button>
            <Button variant="primary" onClick={onNavigateHome}>
                العودة للصفحة الرئيسية
            </Button>
        </div>
    </div>
);


export default CheckoutPage;