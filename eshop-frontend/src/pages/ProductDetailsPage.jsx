import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productApi } from '../api/productApi';
import { useCart } from '../context/CartContext';
import ProductDetail from '../features/products/ProductDetail';
import Spinner from '../components/ui/Spinner';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

const ProductDetailsPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // مراجع للعناصر التي سيتم تحريكها باستخدام GSAP
  const containerRef = useRef(null);

  const fetchData = async () => {
    try {
      const [productRes, reviewsRes] = await Promise.all([
        productApi.getById(id),
        productApi.getReviews(id)
      ]);

      if (productRes.success) setProduct(productRes.data);
      if (reviewsRes.success) setReviews(reviewsRes.data);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // تفعيل GSAP Animation عند تحميل المنتج
  useEffect(() => {
    if (!loading && product && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    }
  }, [loading, product]);

  const handleReviewAdded = () => {
    // إعادة تحميل التقييمات فقط عند إضافة تقييم جديد
    productApi.getReviews(id).then(res => {
      if(res.success) setReviews(res.data);
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" variant="primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20 min-h-[60vh] flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4 dark:text-red-400">
          {t('common.error')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('shop.no_products')}
        </p>
        <Link
          to="/shop"
          className="text-primary-600 dark:text-primary-400 hover:underline flex justify-center items-center gap-2 font-medium transition-colors"
        >
          {t('shop.title')}
          {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* مسار التنقل (Breadcrumb) */}
      <nav className="flex mb-8 text-sm text-gray-500 dark:text-gray-400 animate-fade-in">
        <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
          {t('nav.home')}
        </Link>
        <span className="mx-2 text-gray-300 dark:text-gray-600">/</span>
        <Link to="/shop" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
          {t('nav.shop')}
        </Link>
        <span className="mx-2 text-gray-300 dark:text-gray-600">/</span>
        <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ProductDetail
          product={product}
          reviews={reviews}
          onReviewAdded={handleReviewAdded}
        />
      </motion.div>
    </div>
  );
};

export default ProductDetailsPage;