import React, { useState, useEffect } from 'react';
import { productApi } from '../../api/productApi';
import { adminApi } from '../../api/adminApi';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { toast } from 'react-toastify';

const ProductForm = ({ product, onSuccess, onCancel }) => {
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image_url: ''
  });

  // تحميل التصنيفات عند فتح النموذج
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await productApi.getCategories();
        if (res.success) setCategories(res.data);
      } catch (error) {
        console.error('Error fetching categories', error);
      }
    };
    fetchCategories();
  }, []);

  // تعبئة البيانات في حالة التعديل
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock: product.stock,
        category_id: product.category_id,
        image_url: product.image_url || ''
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = formData.image_url;

      // 1. رفع الصورة إذا تم اختيار ملف جديد
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);
        const uploadRes = await adminApi.uploadImage(uploadData);
        if (uploadRes.success) {
          imageUrl = uploadRes.data; // الرابط الذي عاد من السيرفر
        }
      }

      // 2. تجهيز بيانات المنتج
      const productData = {
        ...formData,
        image_url: imageUrl,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category_id: parseInt(formData.category_id)
      };

      // 3. إرسال الطلب (تحديث أو إنشاء)
      if (product) {
        await productApi.update(product.id, productData);
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        await productApi.create(productData);
        toast.success('تم إنشاء المنتج بنجاح');
      }

      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'حدث خطأ أثناء الحفظ');
    } finally {
      setIsSubmitting(false);
    }
  };

  // تحويل التصنيفات لصيغة تناسب Select
  const categoryOptions = [
    { value: '', label: 'اختر تصنيفاً' },
    ...categories.map(c => ({ value: c.id, label: c.name }))
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="اسم المنتج"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
        <textarea
          name="description"
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="السعر"
          name="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <Input
          label="المخزون"
          name="stock"
          type="number"
          value={formData.stock}
          onChange={handleChange}
          required
        />
      </div>

      <Select
        label="التصنيف"
        name="category_id"
        value={formData.category_id}
        onChange={handleChange}
        options={categoryOptions}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">صورة المنتج</label>
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {formData.image_url && !imageFile && (
          <p className="mt-1 text-xs text-gray-500">الصورة الحالية محفوظة. ارفع ملفاً جديداً لتغييرها.</p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {product ? 'حفظ التعديلات' : 'إضافة المنتج'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;