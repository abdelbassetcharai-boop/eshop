import React from 'react';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { Filter, RotateCcw } from 'lucide-react';

const ProductFilter = ({ categories, filters, onFilterChange, onClearFilters }) => {
  // تحويل التصنيفات لخيارات Select
  const categoryOptions = [
    { value: '', label: 'جميع التصنيفات' },
    ...categories.map(cat => ({ value: cat.id, label: cat.name }))
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-fit sticky top-20">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          تصفية المنتجات
        </h3>
        <button
          onClick={onClearFilters}
          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          إعادة تعيين
        </button>
      </div>

      <div className="space-y-4">
        {/* بحث بالكلمة */}
        <div>
          <Input
            label="بحث"
            name="keyword"
            placeholder="اسم المنتج..."
            value={filters.keyword || ''}
            onChange={handleChange}
          />
        </div>

        {/* تصنيف */}
        <div>
          <Select
            label="التصنيف"
            name="category"
            options={categoryOptions}
            value={filters.category || ''}
            onChange={handleChange}
          />
        </div>

        {/* زر التطبيق (اختياري لأن التحديث فوري) */}
        <Button className="w-full mt-2" onClick={() => onFilterChange(filters)}>
          بحث
        </Button>
      </div>
    </div>
  );
};

export default ProductFilter;