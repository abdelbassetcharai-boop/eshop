import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productApi } from '../api/productApi';
import ProductDetail from '../features/products/ProductDetail';
import Spinner from '../components/ui/Spinner';
import { ArrowRight } from 'lucide-react';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [productRes, reviewsRes] = await Promise.all([
        productApi.getById(id),
        productApi.getReviews(id)
      ]);

      if (productRes.success) setProduct(productRes.data);
      if (reviewsRes.success) setReviews(reviewsRes.data);
    } catch (err) {
      setError('لم يتم العثور على المنتج');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleReviewAdded = () => {
    // إعادة تحميل التقييمات فقط عند إضافة تقييم جديد
    productApi.getReviews(id).then(res => {
      if(res.success) setReviews(res.data);
    });
  };

  if (loading) return <div className="py-20"><Spinner /></div>;

  if (error || !product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link to="/shop" className="text-indigo-600 hover:underline flex justify-center items-center gap-2">
          العودة للمتجر <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {/* Breadcrumb بسيط */}
      <nav className="flex mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-indigo-600">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-indigo-600">المتجر</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <ProductDetail
        product={product}
        reviews={reviews}
        onReviewAdded={handleReviewAdded}
      />
    </div>
  );
};

export default ProductDetailsPage;