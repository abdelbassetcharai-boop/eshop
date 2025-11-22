import React, { useState, useEffect } from 'react';
// تم تصحيح المسارات: الخروج من cart_checkout ثم features والدخول إلى api
import { getUserAddressesApi, getShippingZonesApi, calculateShippingApi, addAddressApi } from '../../api/orderApi';
// تم تصحيح المسار: الخروج من cart_checkout ثم features والدخول إلى context
import { useSystem } from '../../context/SystemContext';
// تم تصحيح المسار: الخروج من cart_checkout ثم features والدخول إلى components/ui
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
// تم تصحيح المسار: الخروج من cart_checkout ثم features والدخول إلى components
import LoadingSpinner from '../../components/LoadingSpinner';

// أيقونات SVG المضمنة
const IconHome = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-4a1 1 0 00-1-1h-2a1 1 0 00-1 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
  </svg>
);

const IconPlus = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 5a.75.75 0 01.75.75v3.5h3.5a.75.75 0 010 1.5h-3.5v3.5a.75.75 0 01-1.5 0v-3.5h-3.5a.75.75 0 010-1.5h3.5v-3.5A.75.75 0 0110 5z" clipRule="evenodd" />
  </svg>
);

/**
 * مكون اختيار العنوان ومنطقة الشحن (Address Selection)
 * @param {object} cartSummary - ملخص السلة للحصول على total.
 * @param {function} onSelectionComplete - دالة يتم استدعاؤها عند اختيار العنوان بنجاح.
 */
const AddressSelection = ({ cartSummary, onSelectionComplete }) => {
  const { shippingZones: availableZones } = useSystem();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // حالة النماذج والاختيار
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [shippingCost, setShippingCost] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // حالة نموذج العنوان الجديد
  const [newAddress, setNewAddress] = useState({ title: '', address: '', city: '', phone: '' });

  // 1. جلب البيانات (العناوين ومناطق الشحن)
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [addressRes] = await Promise.all([
        getUserAddressesApi(),
        // مناطق الشحن يتم جلبها مسبقاً في SystemContext
      ]);
      setAddresses(addressRes.addresses || []);
    } catch (err) {
      setError(err.message || 'فشل جلب العناوين المحفوظة.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. حساب تكلفة الشحن عند تغيير المنطقة أو إجمالي السلة
  useEffect(() => {
    const calculateCost = async () => {
      // يجب أن يكون cartSummary.total هو رقم، وليس كائناً
      if (!selectedZoneId || !cartSummary.total || isNaN(cartSummary.total)) {
        setShippingCost(null);
        return;
      }
      try {
        const response = await calculateShippingApi({
          shipping_zone_id: selectedZoneId,
          total_price: cartSummary.total
        });
        setShippingCost(parseFloat(response.shipping.cost));
        setMessage(null);
      } catch (err) {
        setShippingCost(null);
        setMessage({ type: 'error', text: err.message || 'فشل حساب تكلفة الشحن.' });
      }
    };
    calculateCost();
  }, [selectedZoneId, cartSummary.total]);

  // 3. معالجة إضافة عنوان جديد
  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const response = await addAddressApi(newAddress);

      // تحديث قائمة العناوين وإلغاء النموذج
      setAddresses(prev => [...prev, response.address]);
      setSelectedAddressId(response.address.id); // اختيار العنوان الجديد تلقائياً
      setShowNewAddressForm(false);
      setNewAddress({ title: '', address: '', city: '', phone: '' });
      setMessage({ type: 'success', text: 'تم حفظ العنوان الجديد.' });

    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'فشل إضافة العنوان.' });
    }
  };

  // 4. الانتقال للخطوة التالية (تأكيد)
  const handleContinue = () => {
    if (!selectedAddressId || shippingCost === null || selectedZoneId === '') {
      setMessage({ type: 'error', text: 'يرجى اختيار العنوان وتحديد منطقة الشحن أولاً.' });
      return;
    }

    const addressData = addresses.find(a => a.id === selectedAddressId);

    // استدعاء الدالة الخارجية لتمرير البيانات للـ Checkout Page
    onSelectionComplete({
      address: addressData,
      shippingCost: shippingCost,
      zoneId: selectedZoneId
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-xl border border-red-300">
        <p>{error}</p>
      </div>
    );
  }

  // افتراض عملة إذا لم تكن موجودة في الملخص
  const currency = cartSummary.currency || 'SAR';
  const totalWithShipping = cartSummary.total + (shippingCost || 0);

  return (
    <div style={{ direction: 'rtl' }} className="space-y-8">

      {/* رسالة حالة */}
      {message && (
        <div
          className={`p-4 rounded-xl font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}
        >
          {message.text}
        </div>
      )}

      {/* 1. اختيار العنوان المحفوظ */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 border-b pb-2">1. اختيار عنوان الشحن</h2>

        {/* قائمة العناوين */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(address => (
            <div
              key={address.id}
              onClick={() => setSelectedAddressId(address.id)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition duration-200
                ${selectedAddressId === address.id ? 'border-[var(--primary-color)] shadow-md' : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'}`}
            >
              <h3 className="font-bold flex items-center text-gray-800 dark:text-gray-100">
                <IconHome className="w-5 h-5 ml-2 text-[var(--secondary-color)]" />
                {address.title || 'العنوان الرئيسي'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                {address.address}, {address.city}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                هاتف: {address.phone}
              </p>
            </div>
          ))}
        </div>

        {/* زر إضافة عنوان جديد */}
        <Button
          variant="outline"
          onClick={() => setShowNewAddressForm(!showNewAddressForm)}
          className="w-full mt-4 text-sm"
        >
          <IconPlus className="w-4 h-4 ml-2" />
          {showNewAddressForm ? 'إلغاء إضافة عنوان جديد' : 'أو أضف عنواناً جديداً'}
        </Button>
      </div>

      {/* 2. نموذج إضافة عنوان جديد (مشروط) */}
      {showNewAddressForm && (
        <form onSubmit={handleAddNewAddress} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 space-y-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 border-b pb-2">إضافة عنوان جديد</h3>
          <Input
            label="اسم العنوان (المنزل/العمل)"
            value={newAddress.title}
            onChange={(e) => setNewAddress({...newAddress, title: e.target.value})}
            required
          />
          <Input
            label="العنوان التفصيلي"
            value={newAddress.address}
            onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
            required
          />
          <Input
            label="المدينة"
            value={newAddress.city}
            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
            required
          />
          <Input
            label="رقم الهاتف"
            type="tel"
            value={newAddress.phone}
            onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
            required
          />
          <Button type="submit" variant="secondary" className="w-full">
            حفظ العنوان واختياره
          </Button>
        </form>
      )}

      {/* 3. اختيار منطقة الشحن */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 border-b pb-2">2. تحديد منطقة الشحن</h2>

        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
          اختر المدينة/المنطقة:
        </label>

        <select
          value={selectedZoneId}
          onChange={(e) => setSelectedZoneId(e.target.value)}
          className="shadow-sm border border-gray-300 dark:border-gray-600 rounded-xl w-full py-3 px-4 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition"
          style={{ borderRadius: 'var(--border-radius)' }}
        >
          <option value="">-- اختر منطقة الشحن --</option>
          {availableZones.map(zone => (
            <option key={zone.id} value={zone.id}>
              {zone.name} ({zone.base_cost} {currency})
            </option>
          ))}
        </select>

        {/* عرض تكلفة الشحن المحسوبة */}
        <div className="mt-4 text-right">
            {shippingCost !== null ? (
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    تكلفة الشحن المحسوبة: {shippingCost.toFixed(2)} {currency}
                </p>
            ) : selectedZoneId ? (
                <p className="text-amber-500">جاري حساب التكلفة...</p>
            ) : (
                <p className="text-gray-500">يرجى تحديد المنطقة لحساب التكلفة.</p>
            )}
        </div>
      </div>

      {/* زر المتابعة للدفع */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="primary"
          onClick={handleContinue}
          disabled={!selectedAddressId || shippingCost === null}
          className="w-full text-lg py-3 shadow-xl"
        >
          المتابعة إلى الدفع ({totalWithShipping.toFixed(2)} {currency})
        </Button>
      </div>
    </div>
  );
};

export default AddressSelection;