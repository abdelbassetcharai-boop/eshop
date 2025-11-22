import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
// تم تصحيح المسار: الخروج من products ثم features والدخول إلى api
import { getAllProductsApi, getAllCategoriesApi } from '../../api/productApi';
// المسار الصحيح: في نفس المجلد
import ProductCard from './ProductCard';
// تم تصحيح المسار: الخروج من products ثم features والدخول إلى components
import LoadingSpinner from '../../components/LoadingSpinner';
// تم تصحيح المسار: الخروج من products ثم features والدخول إلى context
import { useSystem } from '../../context/SystemContext';

/**
 * مكون قائمة المنتجات (Product List)
 * مسؤول عن جلب وعرض المنتجات مع دعم التصفية والبحث.
 * هذا المكون هو قلب صفحة ShopPage.
 */
const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // استخدام useSearchParams للتحكم في حالة الفلترة عبر URL
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || '';

  const { config } = useSystem();

  // 1. جلب البيانات (المنتجات والفئات)
  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      setLoading(true);
      setError(null);

      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          getAllProductsApi({ categoryId: selectedCategory || undefined }),
          getAllCategoriesApi() // يفترض وجود مسار عام للفئات
        ]);

        setProducts(productsResponse.products || []);
        setCategories(categoriesResponse.data || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'فشل جلب المنتجات أو الفئات.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndCategories();
  }, [selectedCategory]); // يعاد التشغيل عند تغيير الفئة المحددة

  // 2. معالجة التصفية (Filtering)
  const handleCategoryChange = (categoryId) => {
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({}); // لإزالة البارامتر وعرض كل المنتجات
    }
  };

  // 3. عرض حالة التحميل
  if (loading) {
    // نستخدم سبينر التحميل المدمج
    return <div className="min-h-96 flex justify-center items-center"><LoadingSpinner /></div>;
  }

  // 4. عرض حالة الخطأ
  if (error) {
    return (
      <div className="text-center p-10 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-xl border border-red-300 mt-8">
        <h2 className="text-xl font-bold mb-2">عفواً، حدث خطأ.</h2>
        <p>{error}</p>
      </div>
    );
  }

  // 5. عرض القائمة الرئيسية
  return (
    <div style={{ direction: 'rtl', fontFamily: 'var(--font-family)' }}>
      {/* شريط الفلاتر والتصنيفات */}
      <div className="mb-8 flex flex-wrap gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <button
          onClick={() => handleCategoryChange('')}
          className={`px-4 py-2 text-sm font-medium rounded-full transition ${!selectedCategory ? 'bg-[var(--primary-color)] text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
          عرض الكل
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition ${selectedCategory == category.id ? 'bg-[var(--primary-color)] text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* عرض شبكة المنتجات (الشبكة المتجاوبة) */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center p-10 text-gray-500 dark:text-gray-400 border border-dashed rounded-xl">
          لا توجد منتجات مطابقة لمرشحات البحث.
        </div>
      )}
    </div>
  );
};

export default ProductList;