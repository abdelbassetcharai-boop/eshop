import React from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Filter, RotateCcw , Search} from 'lucide-react';
import { motion } from 'framer-motion';

const ProductFilter = ({ categories, filters, onFilterChange, onClearFilters }) => {
  const { t } = useTranslation();

  // تحويل التصنيفات لخيارات Select
  const categoryOptions = [
    { value: '', label: t('shop.all_categories') || 'All Categories' },
    ...categories.map(cat => ({ value: cat.id, label: cat.name }))
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    // يتم تطبيق التغيير فوراً لتحديث القائمة بشكل ديناميكي
    onFilterChange({ ...filters, [name]: value });
  };

  // تحديد ما إذا كانت هناك فلاتر مطبقة حاليًا (لإظهار زر إعادة الضبط)
  const hasFiltersApplied = filters.keyword || filters.category;

  return (
    <Card
      // تم تغيير top-24 إلى top-20 ليتناسب بشكل أفضل مع الهيدر الثابت
      className="shadow-xl h-fit sticky top-20 transform transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-3">
          <Filter className="h-6 w-6 text-primary-600" />
          {t('shop.filter') || 'Filter Products'}
        </h3>
        {/* زر إعادة الضبط - يظهر فقط عندما تكون هناك فلاتر مطبقة */}
        {hasFiltersApplied && (
          <button
            onClick={onClearFilters}
            className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 transition-colors group"
            title={t('common.reset') || 'Reset Filters'}
          >
            <RotateCcw className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
            <span className="hidden sm:inline">{t('common.reset') || 'Reset'}</span>
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* بحث بالكلمة */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Input
            label={t('common.search')}
            name="keyword"
            placeholder={t('common.search_placeholder')}
            value={filters.keyword || ''}
            onChange={handleChange}
            icon={<Search className="h-5 w-5" />}
          />
        </motion.div>

        {/* تصنيف */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
          <Select
            label={t('product.category') || 'Category'}
            name="category"
            options={categoryOptions}
            value={filters.category || ''}
            onChange={handleChange}
          />
        </motion.div>

        {/* تم حذف زر التطبيق لأنه تحديث فوري (ديناميكي) */}
      </div>
    </Card>
  );
};

export default ProductFilter;