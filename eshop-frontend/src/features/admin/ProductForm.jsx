import React, { useState, useEffect } from 'react';
import { productApi } from '../../api/productApi';
import { adminApi } from '../../api/adminApi';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';
import { Upload, X, Video, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const ProductForm = ({ product, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // إدارة الملفات
  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);

  // معاينة
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image_url: '',
    images: [],
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
      if (product.image_url) setMainImagePreview(product.image_url);
      if (product.video_url) setVideoPreview(product.video_url);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // معالجة الصورة الرئيسية
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  // معالجة الصور الإضافية
  const handleGalleryChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setGalleryFiles(prev => [...prev, ...filesArray]);
    }
  };

  // معالجة الفيديو
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error(t('product.video_invalid_type') || 'Please select a valid video file');
      return;
    }

    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';
    videoElement.onloadedmetadata = function() {
      window.URL.revokeObjectURL(videoElement.src);
      const duration = videoElement.duration;

      if (duration > 60) {
        toast.error(t('product.video_duration_error') || 'Video duration must not exceed 60 seconds');
        setVideoFile(null);
        setVideoPreview(null);
      } else {
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
        toast.success(t('product.video_valid') || 'Video accepted');
      }
    };
    videoElement.src = URL.createObjectURL(file);
  };

  const uploadFile = async (file) => {
    const uploadData = new FormData();
    uploadData.append('image', file);
    const res = await adminApi.uploadImage(uploadData);
    return res.success ? res.data : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let mainImageUrl = formData.image_url;
      let galleryUrls = [...formData.images];
      let videoUrl = formData.video_url;

      if (mainImageFile) {
        const url = await uploadFile(mainImageFile);
        if (url) mainImageUrl = url;
      }

      if (galleryFiles.length > 0) {
        const uploadPromises = galleryFiles.map(file => uploadFile(file));
        const newUrls = await Promise.all(uploadPromises);
        galleryUrls = [...galleryUrls, ...newUrls.filter(url => url !== null)];
      }

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
        toast.success(t('common.success_update') || 'Product updated successfully');
      } else {
        await productApi.create(productData);
        toast.success(t('common.success_create') || 'Product created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = [
    { value: '', label: t('shop.all_categories') },
    ...categories.map(c => ({ value: c.id, label: c.name }))
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto px-1">

      {/* البيانات الأساسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('product.name')}
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <Select
          label={t('product.category') || 'Category'}
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          options={categoryOptions}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          {t('product.description')}
        </label>
        <textarea
          name="description"
          rows="3"
          className="w-full px-4 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('product.price')}
          name="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <Input
          label={t('product.stock') || 'Stock'}
          name="stock"
          type="number"
          value={formData.stock}
          onChange={handleChange}
          required
        />
      </div>

      {/* قسم الوسائط */}
      <div className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
        <h3 className="font-medium text-gray-900 dark:text-white">
          {t('product.media') || 'Media'}
        </h3>

        {/* الصورة الرئيسية */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            {t('product.main_image') || 'Main Image'}
          </label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <ImageIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">{t('common.choose_file') || 'Choose File'}</span>
              <input type="file" onChange={handleMainImageChange} accept="image/*" className="hidden" />
            </label>
            {mainImagePreview && (
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img src={mainImagePreview.startsWith('http') || mainImagePreview.startsWith('blob') ? mainImagePreview : `${import.meta.env.VITE_API_URL.replace('/api', '')}${mainImagePreview}`} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* صور إضافية */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            {t('product.gallery') || 'Gallery Images'}
          </label>
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full sm:w-auto">
            <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">{t('product.upload_images') || 'Upload Images'}</span>
            <input type="file" multiple onChange={handleGalleryChange} accept="image/*" className="hidden" />
          </label>

          {galleryFiles.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {galleryFiles.map((file, index) => (
                <div key={index} className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* فيديو */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
            <Video className="h-4 w-4 text-primary-500" />
            {t('product.video') || 'Product Video (Max 60s)'}
          </label>
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors w-full sm:w-auto">
             <span className="text-sm text-red-600 dark:text-red-400">{t('common.choose_video') || 'Select Video'}</span>
             <input type="file" onChange={handleVideoChange} accept="video/mp4,video/webm" className="hidden" />
          </label>

          {videoPreview && (
            <div className="mt-3 w-full max-w-xs rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <video src={videoPreview.startsWith('http') || videoPreview.startsWith('blob') ? videoPreview : `${import.meta.env.VITE_API_URL.replace('/api', '')}${videoPreview}`} controls className="w-full" />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4 border-t border-gray-100 dark:border-gray-700">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t('common.cancel') || 'Cancel'}
        </Button>
        <Button type="submit" isLoading={isSubmitting} className="shadow-lg shadow-primary-500/20">
          {t('common.save') || 'Save Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;