import React, { useState, useEffect, useRef } from 'react';
import { productApi } from '../../api/productApi';
import { adminApi } from '../../api/adminApi';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { toast } from 'react-toastify';
import { Upload, X, Video, Image as ImageIcon } from 'lucide-react';

const ProductForm = ({ product, onSuccess, onCancel }) => {
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // إدارة الملفات
  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);

  // معاينة
  const [videoPreview, setVideoPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image_url: '',
    images: [], // روابط الصور الإضافية (للتعديل)
    video_url: ''
  });

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

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock: product.stock,
        category_id: product.category_id,
        image_url: product.image_url || '',
        images: product.images || [],
        video_url: product.video_url || ''
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // معالجة الصورة الرئيسية
  const handleMainImageChange = (e) => {
    if (e.target.files[0]) setMainImageFile(e.target.files[0]);
  };

  // معالجة الصور الإضافية
  const handleGalleryChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setGalleryFiles(prev => [...prev, ...filesArray]);
    }
  };

  // معالجة الفيديو (مع التحقق من المدة)
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. التحقق من النوع
    if (!file.type.startsWith('video/')) {
      toast.error('الرجاء اختيار ملف فيديو صالح');
      return;
    }

    // 2. التحقق من المدة (السر!)
    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';
    videoElement.onloadedmetadata = function() {
      window.URL.revokeObjectURL(videoElement.src);
      const duration = videoElement.duration;

      if (duration > 60) {
        toast.error('عذراً، مدة الفيديو يجب ألا تتجاوز 60 ثانية');
        setVideoFile(null);
        setVideoPreview(null);
      } else {
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
        toast.success(`فيديو مقبول (المدة: ${Math.round(duration)} ثانية)`);
      }
    };
    videoElement.src = URL.createObjectURL(file);
  };

  const uploadFile = async (file) => {
    const uploadData = new FormData();
    uploadData.append('image', file); // نستخدم 'image' كمفتاح موحد في الباك إند حالياً
    const res = await adminApi.uploadImage(uploadData);
    return res.success ? res.data : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let mainImageUrl = formData.image_url;
      let galleryUrls = [...formData.images]; // نبدأ بالصور القديمة
      let videoUrl = formData.video_url;

      // 1. رفع الصورة الرئيسية
      if (mainImageFile) {
        const url = await uploadFile(mainImageFile);
        if (url) mainImageUrl = url;
      }

      // 2. رفع صور المعرض
      if (galleryFiles.length > 0) {
        const uploadPromises = galleryFiles.map(file => uploadFile(file));
        const newUrls = await Promise.all(uploadPromises);
        galleryUrls = [...galleryUrls, ...newUrls.filter(url => url !== null)];
      }

      // 3. رفع الفيديو
      if (videoFile) {
        const url = await uploadFile(videoFile);
        if (url) videoUrl = url;
      }

      const productData = {
        ...formData,
        image_url: mainImageUrl,
        images: galleryUrls,
        video_url: videoUrl,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category_id: parseInt(formData.category_id)
      };

      if (product) {
        await productApi.update(product.id, productData);
        toast.success('تم تحديث المنتج');
      } else {
        await productApi.create(productData);
        toast.success('تم إضافة المنتج');
      }

      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = [
    { value: '', label: 'اختر تصنيفاً' },
    ...categories.map(c => ({ value: c.id, label: c.name }))
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-2">

      {/* البيانات الأساسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="اسم المنتج" name="name" value={formData.name} onChange={handleChange} required />
        <Select label="التصنيف" name="category_id" value={formData.category_id} onChange={handleChange} options={categoryOptions} required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
        <textarea name="description" rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.description} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="السعر" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required />
        <Input label="المخزون" name="stock" type="number" value={formData.stock} onChange={handleChange} required />
      </div>

      {/* قسم الوسائط */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-medium text-gray-900">الوسائط المتعددة</h3>

        {/* الصورة الرئيسية */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الصورة الرئيسية</label>
          <input type="file" onChange={handleMainImageChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
        </div>

        {/* صور إضافية */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">صور إضافية (المعرض)</label>
          <input type="file" multiple onChange={handleGalleryChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
          <div className="mt-2 flex gap-2 overflow-x-auto">
            {galleryFiles.map((file, index) => (
              <div key={index} className="relative w-16 h-16">
                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded" alt="" />
              </div>
            ))}
          </div>
        </div>

        {/* فيديو */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Video className="h-4 w-4" />
            فيديو المنتج (دقيقة واحدة كحد أقصى)
          </label>
          <input type="file" onChange={handleVideoChange} accept="video/mp4,video/webm" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" />
          {videoPreview && (
            <div className="mt-2 w-full max-w-xs">
              <video src={videoPreview} controls className="w-full rounded-lg border" />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
        <Button type="submit" isLoading={isSubmitting}>حفظ المنتج</Button>
      </div>
    </form>
  );
};

export default ProductForm;