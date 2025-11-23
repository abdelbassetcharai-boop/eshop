import React, { useState, useEffect } from 'react';
import { productApi } from '../api/productApi';
import ProductList from '../features/products/ProductList';
import ProductFilter from '../features/products/ProductFilter';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // حالة الفلترة والترقيم
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 12; // عدد المنتجات في الصفحة

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

  // تحميل المنتجات عند تغيير الفلتر أو الصفحة
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
  }, [currentPage, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // العودة للصفحة الأولى عند البحث
  };

  const handleClearFilters = () => {
    setFilters({ keyword: '', category: '' });
    setCurrentPage(1);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">المتجر</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* الفلتر الجانبي */}
        <div className="lg:col-span-1">
          <ProductFilter
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* قائمة المنتجات */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="py-20"><Spinner size="lg" /></div>
          ) : (
            <>
              <ProductList products={products} />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;