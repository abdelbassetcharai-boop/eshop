import React, { useState, useEffect } from 'react';
// تم تصحيح المسار: الخروج من admin ثم features والدخول إلى context
import { useSystem } from '../../context/SystemContext';
import { useAuth } from '../../context/AuthContext';
// تم تصحيح المسار: الخروج من admin ثم features والدخول إلى api
import {
    // خدمات CRUD للفئات
    getCategoriesAdminApi, createCategoryApi, updateCategoryApi, deleteCategoryApi,
    // خدمات CRUD للبنرات
    getBannersAdminApi, createBannerApi, updateBannerApi, deleteBannerApi,
    // خدمات CRUD للترجمة
    getTranslationsAdminApi, createTranslationApi, updateTranslationApi, deleteTranslationApi,
    // خدمات تحديث الإعدادات العامة (تم تغيير الاسم من updateConfigs إلى updateConfigsApi)
    updateConfigsApi, updateThemeApi
} from '../../api/adminApi';
import { getAllCategoriesApi } from '../../api/productApi'; // لجلب الفئات للعرض
// تم تصحيح المسار: الخروج من admin ثم features والدخول إلى components
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
// تم حذف استيراد react-icons/fa واستبداله بـ SVG

// ==========================================================
// أيقونات SVG المضمنة (لتجنب أخطاء مكتبات react-icons)
// ==========================================================
const IconCog = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M11.75 3a.75.75 0 00-.75.75v4a.75.75 0 001.5 0v-4a.75.75 0 00-.75-.75zM17.25 11.75h-4a.75.75 0 000 1.5h4a.75.75 0 000-1.5zM7.25 11.75h-4a.75.75 0 000 1.5h4a.75.75 0 000-1.5zM10.75 16.25a.75.75 0 00-.75-.75h-4a.75.75 0 000 1.5h4a.75.75 0 00.75-.75zM5.5 8.75a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zm4 4a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zm4-4a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" clipRule="evenodd" />
  </svg>
);
const IconEdit = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M5.433 13.917V16.5a.5.5 0 00.5.5h2.583a.5.5 0 00.5-.5v-2.583a.5.5 0 00-.146-.354L7.854 11.06a.5.5 0 00-.708 0l-1.5 1.5a.5.5 0 00-.146.354zM15.815 4.315a.75.75 0 00-1.06-1.06l-6.815 6.815a.75.75 0 00-.146.354L7.5 14.5a.5.5 0 00.5.5h2.583a.5.5 0 00.5-.5v-2.583a.5.5 0 00-.146-.354l-6.815-6.815z" />
  </svg>
);
const IconTrash = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8.75 1a.75.75 0 00-.75.75V3H6a1.5 1.5 0 00-1.5 1.5v.75a.75.75 0 001.5 0v-.75a.5.5 0 01.5-.5h.25v10.5a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75V3h.25a.5.5 0 01.5.5v.75a.75.75 0 001.5 0v-.75A1.5 1.5 0 0014 3H11V1.75a.75.75 0 00-.75-.75h-2.5zm-.5 3a.5.5 0 01.5-.5h2.5a.5.5 0 01.5.5v10.5a.5.5 0 01-.5.5h-2.5a.5.5 0 01-.5-.5V4zM8 8.5a.5.5 0 01.5-.5h.5a.5.5 0 010 1h-.5a.5.5 0 01-.5-.5zm4 0a.5.5 0 01.5-.5h.5a.5.5 0 010 1h-.5a.5.5 0 01-.5-.5z" clipRule="evenodd" />
  </svg>
);
const IconPlus = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 5a.75.75 0 01.75.75v3.5h3.5a.75.75 0 010 1.5h-3.5v3.5a.75.75 0 01-1.5 0v-3.5h-3.5a.75.75 0 010-1.5h3.5v-3.5A.75.75 0 0110 5z" clipRule="evenodd" />
  </svg>
);
const IconPalette = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 3a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V5a2 2 0 00-2-2H7zm0 1h6a1 1 0 011 1v2.5a.5.5 0 01-.5.5h-7a.5.5 0 01-.5-.5V5a1 1 0 011-1zm3.5 13a.5.5 0 00-.5.5v2a.5.5 0 001 0v-2a.5.5 0 00-.5-.5zM7 15a.5.5 0 01.5-.5h5a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-5a.5.5 0 01-.5-.5v-2z" />
    </svg>
);
const IconLanguage = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm.75 12.75a.75.75 0 01-1.5 0v-1.5a.75.75 0 011.5 0v1.5zm.75-5a.75.75 0 00-1.5 0v4a.75.75 0 001.5 0v-4zM6 10a.75.75 0 01.75-.75h6.5a.75.75 0 010 1.5H6.75A.75.75 0 016 10z" />
    </svg>
);
const IconList = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm13.5 4.5a.75.75 0 01.75.75v5a.75.75 0 01-1.5 0v-5a.75.75 0 01.75-.75zM12 9.5a.75.75 0 000 1.5h4a.75.75 0 000-1.5h-4zM2.75 13h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 13v-5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75z" clipRule="evenodd" />
    </svg>
);


const SystemSettings = () => {
  const { user } = useAuth();
  // نعتمد على جلب الـ Bootstrap مرة أخرى لتحديث البيانات عند التغيير
  const { config, theme, translations, isLoaded, banners, shippingZones } = useSystem();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('general'); // لإدارة التبويبات

  // 1. حالات إدارة البيانات المؤقتة لـ CRUD
  const [categoryList, setCategoryList] = useState([]);
  const [bannerList, setBannerList] = useState([]);
  const [translationList, setTranslationList] = useState([]);

  // 2. جلب البيانات لـ CRUD (يجب أن تكون هذه البيانات منفصلة عن SystemContext)
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
        const [catRes, bannerRes, transRes] = await Promise.all([
            getCategoriesAdminApi(),
            getBannersAdminApi(),
            getTranslationsAdminApi()
        ]);
        setCategoryList(catRes.data || []);
        setBannerList(bannerRes.data || []);
        setTranslationList(transRes.data || []);
    } catch (err) {
        setError(err.message || 'فشل جلب بيانات الإدارة.');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 3. تحديث الإعدادات العامة والثيم (تستخدم مسار updateConfigs)
  const handleGeneralSubmit = async (formData) => {
    setMessage(null);
    setLoading(true);
    try {
        // تحويل configs
        const configsPayload = [
            { key: 'site_name', value: formData.site_name },
            { key: 'site_logo', value: formData.site_logo },
            { key: 'default_currency', value: formData.default_currency },
            { key: 'maintenance_mode', value: formData.maintenance_mode.toString() },
        ];

        // تحويل theme إلى مصفوفة منفصلة
        const themePayload = [
            { variable_name: '--primary-color', value: formData.primary_color },
            { variable_name: '--font-family', value: formData.font_family },
        ];

        // إرسال تحديث الإعدادات العامة
        await updateConfigsApi({ configs: configsPayload });
        // إرسال تحديث الثيم
        await updateThemeApi({ theme: themePayload });

        setMessage({ type: 'success', text: 'تم تحديث الإعدادات بنجاح. يرجى تحديث الصفحة لرؤية التغييرات.' });
    } catch (err) {
        setMessage({ type: 'error', text: err.message || 'فشل تحديث الإعدادات.' });
    } finally {
        setLoading(false);
    }
  };


  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center p-10 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-xl border border-red-300 mt-8">
        <h2 className="text-xl font-bold mb-2">عفواً، حدث خطأ.</h2>
        <p>{error}</p>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
      return <div className="text-center p-10 bg-red-50 text-red-700 rounded-lg shadow border border-red-300">غير مصرح. يجب أن تكون مشرفاً للوصول إلى إعدادات النظام.</div>;
  }

  const tabs = [
      { id: 'general', title: 'عام / ثيم', icon: IconCog },
      { id: 'categories', title: 'الفئات', icon: IconList },
      { id: 'translations', title: 'الترجمة', icon: IconLanguage },
      { id: 'banners', title: 'البنرات', icon: IconPalette },
  ];

  return (
    <div style={{ direction: 'rtl', fontFamily: 'var(--font-family)' }} className="mt-6">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-8" style={{ color: 'var(--secondary-color)' }}>
        إعدادات النظام الديناميكية
      </h1>

      {/* رسالة حالة (نجاح / خطأ) */}
      {message && (
        <div
          className={`p-4 mb-6 rounded-xl font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}
        >
          {message.text}
        </div>
      )}

      {/* شريط التبويبات (Tabs) */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8 space-x-6 space-x-reverse overflow-x-auto">
          {tabs.map((tab) => (
              <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 space-x-reverse px-4 py-2 font-semibold transition duration-200 ${
                      activeTab === tab.id
                          ? 'border-b-4 border-[var(--primary-color)] text-[var(--primary-color)]'
                          : 'text-gray-600 dark:text-gray-400 hover:text-[var(--primary-color)]'
                  }`}
              >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.title}</span>
              </button>
          ))}
      </div>

      {/* محتوى التبويبات */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700">
          {activeTab === 'general' && <GeneralSettingsTab config={config} theme={theme} onSubmit={handleGeneralSubmit} />}
          {activeTab === 'categories' && <CategoryManagementTab categories={categoryList} refresh={fetchData} />}
          {activeTab === 'translations' && <TranslationManagementTab translations={translationList} refresh={fetchData} />}
          {activeTab === 'banners' && <BannerManagementTab banners={bannerList} refresh={fetchData} />}
      </div>
    </div>
  );
};

// ==========================================================
// 1. تبويبة الإعدادات العامة والثيم
// ==========================================================
const GeneralSettingsTab = ({ config, theme, onSubmit }) => {
    const [formData, setFormData] = useState({
        site_name: config.site_name || '',
        site_logo: config.site_logo || '',
        default_currency: config.default_currency || 'SAR',
        maintenance_mode: config.maintenance_mode === 'true',
        // Theme
        primary_color: theme['--primary-color'] || '#059669',
        font_family: theme['--font-family'] || 'Cairo, sans-serif',
    });

    // عند الإرسال، يجب تقسيم البيانات بين configs و theme
    const handleSubmit = (e) => {
        e.preventDefault();

        // إرسال البيانات المدمجة
        onSubmit(formData);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6" style={{ direction: 'rtl' }}>
            <h3 className="text-xl font-bold border-b pb-2">الإعدادات العامة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="اسم الموقع" name="site_name" value={formData.site_name} onChange={handleChange} required />
                <Input label="رابط الشعار (Logo URL)" name="site_logo" value={formData.site_logo} onChange={handleChange} />
                <Input label="العملة الافتراضية" name="default_currency" value={formData.default_currency} onChange={handleChange} required />

                <label className="flex items-center space-x-2 space-x-reverse text-sm font-semibold text-gray-700 dark:text-gray-300 pt-4">
                    <input
                        type="checkbox"
                        name="maintenance_mode"
                        checked={formData.maintenance_mode}
                        onChange={handleChange}
                        className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span>وضع الصيانة (تعطيل الموقع مؤقتاً)</span>
                </label>
            </div>

            <h3 className="text-xl font-bold border-b pb-2 pt-6">إعدادات الثيم والألوان</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4 space-x-reverse">
                    <Input
                        label="اللون الرئيسي"
                        name="primary_color"
                        type="color"
                        value={formData.primary_color}
                        onChange={handleChange}
                        className="w-full h-12 p-0"
                    />
                    <span className="text-sm font-medium">{formData.primary_color}</span>
                </div>

                <Input label="نوع الخط (CSS Font)" name="font_family" value={formData.font_family} onChange={handleChange} placeholder="Cairo, sans-serif" />
            </div>

            <div className="pt-4 border-t">
                <Button type="submit" variant="primary">حفظ الإعدادات</Button>
            </div>
        </form>
    );
};

// ==========================================================
// 2. تبويبة إدارة الفئات (Category Management)
// ==========================================================
const CategoryManagementTab = ({ categories, refresh }) => {
    // محاكاة لـ Modal
    const [modal, setModal] = useState({ isOpen: false, data: null });

    // محاكاة لـ CRUD
    const handleCategorySubmit = async (formData) => {
        try {
            if (modal.data) {
                await updateCategoryApi(modal.data.id, formData);
            } else {
                await createCategoryApi(formData);
            }
            refresh();
            setModal({ isOpen: false, data: null });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        // يجب استخدام Modal مخصص بدلاً من window.confirm
        if (!window.confirm('هل أنت متأكد من حذف هذه الفئة؟ سيتم حذف المنتجات المرتبطة!')) return;
        try {
            await deleteCategoryApi(id);
            refresh();
        } catch (err) {
            console.error(err);
        }
    };


    return (
        <div style={{ direction: 'rtl' }}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">إدارة الفئات ({categories.length})</h3>
                <Button variant="primary" className='text-sm' onClick={() => setModal({ isOpen: true, data: null })}>
                    <IconPlus className="w-4 h-4 ml-2" />
                    إضافة فئة
                </Button>
            </div>

            <ul className="divide-y divide-gray-200 dark:divide-gray-700 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                {categories.map(cat => (
                    <li key={cat.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <span className="font-medium">{cat.name}</span>
                        <div className="space-x-2 space-x-reverse">
                            <Button variant="ghost" onClick={() => setModal({ isOpen: true, data: cat })}>
                                <IconEdit className="w-4 h-4 text-blue-500" />
                            </Button>
                            <Button variant="ghost" onClick={() => handleDelete(cat.id)}>
                                <IconTrash className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Modal لنموذج الفئة */}
            {modal.isOpen && (
                <SimpleFormModal
                    title={modal.data ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
                    initialData={modal.data || { name: '', description: '' }}
                    fields={[
                        { name: 'name', label: 'اسم الفئة', required: true },
                        { name: 'description', label: 'الوصف', required: false, type: 'textarea' },
                    ]}
                    onSubmit={handleCategorySubmit}
                    onClose={() => setModal({ isOpen: false, data: null })}
                />
            )}
        </div>
    );
};

// ==========================================================
// 3. تبويبة إدارة الترجمة (Translation Management)
// ==========================================================
const TranslationManagementTab = ({ translations, refresh }) => {
    // المنطق هنا مشابه لإدارة الفئات، مع اختلاف أن المفتاح هو `key` وليس `id`
    const [modal, setModal] = useState({ isOpen: false, data: null });

    const handleTranslationSubmit = async (formData) => {
        try {
            if (modal.data) {
                await updateTranslationApi(modal.data.key, formData);
            } else {
                await createTranslationApi(formData);
            }
            refresh();
            setModal({ isOpen: false, data: null });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (key) => {
        if (!window.confirm(`هل أنت متأكد من حذف النص ذو المفتاح: ${key}?`)) return;
        try {
            await deleteTranslationApi(key);
            refresh();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ direction: 'rtl' }}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">إدارة نصوص الواجهة ({translations.length})</h3>
                <Button variant="primary" className='text-sm' onClick={() => setModal({ isOpen: true, data: null })}>
                    <IconPlus className="w-4 h-4 ml-2" />
                    إضافة نص جديد
                </Button>
            </div>

            <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                        <tr className='bg-gray-50 dark:bg-gray-700'>
                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">المفتاح (Key)</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">القيمة (Value)</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">اللغة</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">إجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {translations.map(t => (
                            <tr key={t.key} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                <td className='px-4 py-3 font-mono text-xs'>{t.key}</td>
                                <td className='px-4 py-3 text-sm'>{t.value}</td>
                                <td className='px-4 py-3 text-sm font-semibold'>{t.lang_code}</td>
                                <td className='px-4 py-3 space-x-2 space-x-reverse'>
                                    <Button variant="ghost" onClick={() => setModal({ isOpen: true, data: t })}>
                                        <IconEdit className="w-4 h-4 text-blue-500" />
                                    </Button>
                                    <Button variant="ghost" onClick={() => handleDelete(t.key)}>
                                        <IconTrash className="w-4 h-4 text-red-500" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal لنموذج الترجمة */}
            {modal.isOpen && (
                <SimpleFormModal
                    title={modal.data ? 'تعديل النص' : 'إضافة نص جديد'}
                    initialData={modal.data || { key: '', lang_code: 'ar', value: '' }}
                    fields={[
                        { name: 'key', label: 'المفتاح (key)', required: true, disabled: !!modal.data },
                        { name: 'lang_code', label: 'كود اللغة (ar/en)', required: true, disabled: !!modal.data },
                        { name: 'value', label: 'النص (القيمة)', required: true, type: 'textarea' },
                    ]}
                    onSubmit={handleTranslationSubmit}
                    onClose={() => setModal({ isOpen: false, data: null })}
                />
            )}
        </div>
    );
};

// ==========================================================
// 4. تبويبة إدارة البنرات (Banner Management)
// ==========================================================
const BannerManagementTab = ({ banners, refresh }) => {
    // المنطق هنا مشابه لإدارة الفئات
    const [modal, setModal] = useState({ isOpen: false, data: null });

    const handleBannerSubmit = async (formData) => {
        try {
            if (modal.data) {
                await updateBannerApi(modal.data.id, formData);
            } else {
                await createBannerApi(formData);
            }
            refresh();
            setModal({ isOpen: false, data: null });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا البنر؟')) return;
        try {
            await deleteBannerApi(id);
            refresh();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ direction: 'rtl' }}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">إدارة البنرات الإعلانية ({banners.length})</h3>
                <Button variant="primary" className='text-sm' onClick={() => setModal({ isOpen: true, data: null })}>
                    <IconPlus className="w-4 h-4 ml-2" />
                    إضافة بنر
                </Button>
            </div>

            <ul className="space-y-4">
                {banners.map(banner => (
                    <li key={banner.id} className="p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl shadow-md">
                        <div className="flex items-center space-x-4 space-x-reverse">
                            <img src={banner.image_url || 'https://placehold.co/100x40'} alt={banner.title} className="w-24 h-12 object-cover rounded-lg" />
                            <div className='text-sm'>
                                <p className="font-medium">{banner.title || 'بنر بدون عنوان'}</p>
                                <p className="text-xs text-gray-500">{banner.position} | الترتيب: {banner.sort_order}</p>
                            </div>
                        </div>
                        <div className="space-x-2 space-x-reverse">
                            <Button variant="ghost" onClick={() => setModal({ isOpen: true, data: banner })}>
                                <IconEdit className="w-4 h-4 text-blue-500" />
                            </Button>
                            <Button variant="ghost" onClick={() => handleDelete(banner.id)}>
                                <IconTrash className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Modal لنموذج البنر */}
            {modal.isOpen && (
                <SimpleFormModal
                    title={modal.data ? 'تعديل البنر' : 'إضافة بنر جديد'}
                    initialData={modal.data || { title: '', image_url: '', link_url: '', position: 'main_slider', sort_order: 0, is_active: true }}
                    fields={[
                        { name: 'title', label: 'العنوان', required: false },
                        { name: 'image_url', label: 'رابط الصورة (URL)', required: true },
                        { name: 'link_url', label: 'رابط الوجهة', required: false },
                        { name: 'position', label: 'موقع العرض', required: true },
                        { name: 'sort_order', label: 'ترتيب العرض', required: true, type: 'number' },
                        { name: 'is_active', label: 'نشط', required: false, type: 'checkbox' },
                    ]}
                    onSubmit={handleBannerSubmit}
                    onClose={() => setModal({ isOpen: false, data: null })}
                />
            )}
        </div>
    );
};

// ==========================================================
// المكون المساعد: Modal لنموذج بسيط (يستخدم لـ Categories, Translations, Banners)
// ==========================================================
const SimpleFormModal = ({ title, initialData, fields, onSubmit, onClose }) => {
    const [formData, setFormData] = useState(initialData);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // في الإرسال الحقيقي يجب معالجة الأخطاء هنا
        onSubmit(formData);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-3xl overflow-y-auto max-h-[90vh]">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
                        <button onClick={onClose} type="button" className="text-gray-500 hover:text-red-500 transition">
                            <IconTrash className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        {fields.map(field => {
                            const isTextarea = field.type === 'textarea';
                            const isCheckbox = field.type === 'checkbox';

                            return (
                                <div key={field.name}>
                                    <label className={`block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300 ${isCheckbox ? 'flex items-center space-x-2 space-x-reverse' : ''}`}>
                                        {isCheckbox && (
                                            <input
                                                type="checkbox"
                                                name={field.name}
                                                checked={formData[field.name] || false}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-[var(--primary-color)] border-gray-300 rounded focus:ring-[var(--primary-color)]"
                                                disabled={field.disabled}
                                            />
                                        )}
                                        {!isCheckbox && field.label} {field.required && <span className="text-red-500">*</span>}

                                    </label>

                                    {!isCheckbox && isTextarea && (
                                        <textarea
                                            name={field.name}
                                            value={formData[field.name] || ''}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl transition shadow-sm text-gray-800 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                                            style={{ borderRadius: 'var(--border-radius)' }}
                                            disabled={field.disabled}
                                        />
                                    )}

                                    {!isCheckbox && !isTextarea && (
                                        <Input
                                            name={field.name}
                                            type={field.type || 'text'}
                                            value={formData[field.name] || ''}
                                            onChange={handleChange}
                                            required={field.required}
                                            disabled={field.disabled}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                        <Button type="submit" variant="primary" isLoading={loading} disabled={loading}>
                            حفظ التغييرات
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default SystemSettings;