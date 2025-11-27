import React, { useState, useEffect } from 'react';
import { addressApi } from '../../api/addressApi';
import { useSystem } from '../../context/SystemContext'; // لجلب إعدادات الحقول
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal'; // مكون النافذة المنبثقة
import Input from '../../components/ui/Input';
import { MapPin, Plus, CheckCircle, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const AddressSelection = ({ selectedId, onSelect }) => {
  const { t } = useTranslation();
  const { config } = useSystem(); // إعدادات المتجر (الحقول الديناميكية)
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false); // حالة فتح النافذة
  const [isSubmitting, setIsSubmitting] = useState(false);

  // حالة النموذج الجديد (بيانات العنوان)
  const [newAddress, setNewAddress] = useState({
    title: '',
    address: '', // هذا سيكون الحقل الرئيسي (السطر 1)
    address_line2: '',
    city: '',
    postal_code: '',
    country: 'Morocco', // افتراضي
    phone: ''
  });

  // جلب العناوين عند التحميل
  const fetchAddresses = async () => {
    try {
      const res = await addressApi.getAll();
      if (res.success) {
        setAddresses(res.data);
        // تحديد أول عنوان تلقائياً إذا لم يتم التحديد
        if (res.data.length > 0 && !selectedId) {
          onSelect(res.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch addresses', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []); // يتم التشغيل مرة واحدة فقط عند التحميل

  // معالجة تغييرات حقول الإدخال
  const handleChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  // حفظ العنوان الجديد
  const handleAddAddress = async (e) => {
    e.preventDefault();

    // التحقق من الحقول المطلوبة (الديناميكية)
    const fields = config?.addressFields || {};
    if (fields.city?.required && !newAddress.city) return toast.error('المدينة مطلوبة');
    if (fields.phone?.required && !newAddress.phone) return toast.error('رقم الهاتف مطلوب');
    if (!newAddress.address) return toast.error('العنوان مطلوب');

    setIsSubmitting(true);
    try {
      // مواءمة أسماء الحقول مع الباك إند (address_line1 هو address)
      const addressData = {
          address_line1: newAddress.address, // مهم جداً
          address_line2: newAddress.address_line2,
          city: newAddress.city,
          postal_code: newAddress.postal_code,
          country: newAddress.country,
          phone: newAddress.phone,
          title: newAddress.title || 'Home'
      };

      const res = await addressApi.add(addressData);
      if (res.success) {
        toast.success('تم إضافة العنوان بنجاح');
        setIsAdding(false); // إغلاق النافذة
        setNewAddress({ title: '', address: '', address_line2: '', city: '', postal_code: '', country: 'Morocco', phone: '' }); // تصفير النموذج
        fetchAddresses(); // تحديث القائمة
        onSelect(res.data.id); // تحديد العنوان الجديد تلقائياً
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل إضافة العنوان');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id, e) => {
      e.stopPropagation(); // لمنع تحديد العنوان عند الضغط على حذف
      if(!window.confirm('هل أنت متأكد من حذف هذا العنوان؟')) return;
      try {
          await addressApi.delete(id);
          toast.success('تم حذف العنوان');
          fetchAddresses();
          if(selectedId === id) onSelect(null);
      } catch (error) {
          toast.error('فشل الحذف');
      }
  };

  // إعدادات الحقول من السيستم (أو افتراضية)
  const fieldsConfig = config?.addressFields || {
      postal_code: { enabled: true, required: false, label: 'الرمز البريدي' },
      city: { enabled: true, required: true, label: 'المدينة' },
      address_line2: { enabled: true, required: false, label: 'تفاصيل إضافية' },
      phone: { enabled: true, required: true, label: 'رقم الهاتف' }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spinner size="md" variant="primary" />
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <MapPin className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          {t('checkout.shipping_address') || 'عنوان الشحن'}
        </h2>

        {/* زر فتح النافذة - تم تفعيله الآن */}
        <Button
            size="sm"
            variant="secondary"
            className="flex items-center gap-1 shadow-sm"
            onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4" />
          {t('checkout.add_new_address') || 'إضافة جديد'}
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <MapPin className="h-10 w-10 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            {t('checkout.no_address') || 'لا توجد عناوين محفوظة. يرجى إضافة عنوان جديد.'}
            </p>
            <Button variant="primary" size="sm" onClick={() => setIsAdding(true)}>
                إضافة عنوان الآن
            </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="space-y-4"
        >
          {addresses.map((addr) => (
            <motion.div
              key={addr.id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={() => onSelect(addr.id)}
              className={`
                relative p-4 border rounded-xl cursor-pointer transition-all duration-200 shadow-sm group
                ${selectedId === addr.id
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-dark-card'}
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                    <div className='flex items-center gap-2 mb-1'>
                        <span className='font-bold text-gray-900 dark:text-white'>{addr.title || 'Home'}</span>
                        {selectedId === addr.id && <Badge variant="success" className="text-[10px]">محدد</Badge>}
                    </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {addr.address_line1}
                    {addr.address_line2 && `, ${addr.address_line2}`}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {addr.city}, {addr.country} {addr.postal_code && `- ${addr.postal_code}`}
                  </p>
                  {addr.phone && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <span className='opacity-70'>هاتف:</span> {addr.phone}
                    </p>
                  )}
                </div>

                {/* أيقونة التحديد والحذف */}
                <div className="flex flex-col items-end gap-2">
                    {selectedId === addr.id ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                    )}
                    <button
                        onClick={(e) => handleDeleteAddress(addr.id, e)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="حذف العنوان"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* --- النافذة المنبثقة لإضافة العنوان (Modal) --- */}
      <Modal
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        title="إضافة عنوان شحن جديد"
      >
        <form onSubmit={handleAddAddress} className="space-y-4">
            <Input
                label="اسم العنوان (مثال: المنزل، العمل)"
                name="title"
                value={newAddress.title}
                onChange={handleChange}
                placeholder="المنزل"
            />

            <Input
                label="العنوان (الشارع، الحي)"
                name="address"
                value={newAddress.address}
                onChange={handleChange}
                required
            />

            {/* حقول ديناميكية بناءً على الإعدادات */}
            {fieldsConfig.address_line2?.enabled && (
                <Input
                    label={fieldsConfig.address_line2.label}
                    name="address_line2"
                    value={newAddress.address_line2}
                    onChange={handleChange}
                    required={fieldsConfig.address_line2.required}
                />
            )}

            <div className="grid grid-cols-2 gap-4">
                {fieldsConfig.city?.enabled && (
                    <Input
                        label={fieldsConfig.city.label}
                        name="city"
                        value={newAddress.city}
                        onChange={handleChange}
                        required={fieldsConfig.city.required}
                    />
                )}
                {fieldsConfig.postal_code?.enabled && (
                    <Input
                        label={fieldsConfig.postal_code.label}
                        name="postal_code"
                        value={newAddress.postal_code}
                        onChange={handleChange}
                        required={fieldsConfig.postal_code.required}
                    />
                )}
            </div>

            {fieldsConfig.phone?.enabled && (
                <Input
                    label={fieldsConfig.phone.label}
                    name="phone"
                    type="tel"
                    value={newAddress.phone}
                    onChange={handleChange}
                    required={fieldsConfig.phone.required}
                    icon={<span className='text-xs font-bold text-gray-400 px-2'>+212</span>} // رمز المغرب
                    className="rtl:pl-12 ltr:pr-12" // تعديل الحشوة للأيقونة
                />
            )}

            <div className="flex justify-end pt-4 gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>
                    إلغاء
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                    حفظ العنوان
                </Button>
            </div>
        </form>
      </Modal>
    </Card>
  );
};

// مكون مساعد بسيط للبادج (إذا لم يكن موجوداً في مكان آخر)
const Badge = ({ children, variant, className }) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${variant === 'success' ? 'bg-green-100 text-green-800' : 'bg-gray-100'} ${className}`}>
        {children}
    </span>
);

export default AddressSelection;