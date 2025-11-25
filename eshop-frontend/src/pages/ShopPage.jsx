import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { productApi } from '../api/productApi';
import ProductList from '../features/products/ProductList';
import ProductFilter from '../features/products/ProductFilter';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';
import { Search, SlidersHorizontal } from 'lucide-react';

const ShopPage = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // للموبايل

  // حالة الفلترة والترقيم
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 12;

  // تحميل التصنيفات مرة واحدة
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await productApi.getCategories();
        if (res.success) setCategories(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCategories();
  }, []);

  // تحميل المنتجات
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: LIMIT,
          keyword: filters.keyword,
          category: filters.category
        };
        const res = await productApi.getAll(params);
        if (res.success) {
          setProducts(res.data);
          setTotalPages(res.pagination.pages);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    // التمرير للأعلى عند تغيير الصفحة
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ keyword: '', category: '' });
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* رأس الصفحة (العنوان وزر الفلتر للموبايل) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('shop.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t('hero.subtitle').split('.')[0]} {/* استخدام جزء من النص الموجود */}
          </p>
        </div>

        <button
          className="md:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 shadow-sm"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t('shop.filter')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* الفلتر الجانبي (Sidebar) */}
        <motion.div
          className={`lg:col-span-1 lg:block ${isFilterOpen ? 'block' : 'hidden'}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ProductFilter
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </motion.div>

        {/* قائمة المنتجات (Main Content) */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
              <Spinner size="lg" variant="primary" />
              <p className="text-gray-500 dark:text-gray-400 animate-pulse">
                {t('common.loading')}
              </p>
            </div>
          ) : (
            <>
              {products.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <ProductList products={products} />

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </motion.div>
              ) : (
                <div className="text-center py-20 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="mx-auto w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {t('shop.no_products')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {t('common.search_placeholder')}
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-4 text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium"
                  >
                    {t('shop.all_categories')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;