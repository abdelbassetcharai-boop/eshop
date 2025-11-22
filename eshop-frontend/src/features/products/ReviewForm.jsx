import React, { useState } from 'react';
// المسار الصحيح: من features/products إلى context/
import { useAuth } from '../../context/AuthContext';
// المسار الصحيح: من features/products إلى api/
import { addReviewApi } from '../../api/productApi';
// المسار الصحيح: من features/products إلى components/ui/
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

// أيقونة النجمة لتقييم النجوم
const IconStar = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.05 7.927c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
  </svg>
);

/**
 * مكون نموذج إضافة تقييم لمنتج محدد.
 * @param {number} productId - ID المنتج الذي يتم تقييمه.
 * @param {function} onReviewSubmitted - دالة يتم تشغيلها بعد نجاح التقييم (لتحديث القائمة).
 */
const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const { isAuthenticated } = useAuth();

  // لتعيين النجوم عند التمرير (Hover)
  const [hoverRating, setHoverRating] = useState(0);

  // معالجة النجوم عند الضغط
  const handleRatingClick = (newRating) => {
    setRating(newRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setMessage({ type: 'error', text: 'يرجى اختيار تقييم بالنجوم.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await addReviewApi(productId, { rating, comment });
      setMessage({ type: 'success', text: 'تم إضافة تقييمك بنجاح. شكراً لك!' });

      // إعادة تعيين النموذج
      setRating(0);
      setComment('');

      // تشغيل الدالة الخارجية لتحديث قائمة المراجعات
      if (onReviewSubmitted) onReviewSubmitted();

    } catch (err) {
      console.error('Review Submission Error:', err);
      setMessage({ type: 'error', text: err.message || 'فشل إضافة التقييم. هل قمت بشراء المنتج؟' });
    } finally {
      setLoading(false);
    }
  };

  // رسالة إذا لم يكن مسجلاً الدخول
  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-xl text-center border border-gray-200 dark:border-gray-600">
        <p className="text-gray-700 dark:text-gray-300">
          <span className='font-bold' style={{ color: 'var(--primary-color)' }}>يرجى تسجيل الدخول</span> لإضافة تقييمك لهذا المنتج.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700" style={{ direction: 'rtl' }}>
      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 border-b pb-2">أضف تقييمك</h3>

      {/* رسالة حالة (نجاح / خطأ) */}
      {message && (
        <div className={`p-3 mb-4 rounded-lg font-medium text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* نظام النجوم */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            تقييم النجوم (مطلوب)
          </label>
          <div className="flex space-x-1 space-x-reverse text-3xl">
            {Array(5).fill(0).map((_, index) => {
              const starValue = index + 1;
              const isFilled = starValue <= (hoverRating || rating);
              return (
                <IconStar
                  key={index}
                  className={`w-8 h-8 cursor-pointer transition-colors duration-150 ${isFilled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                  onClick={() => handleRatingClick(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              );
            })}
          </div>
        </div>

        {/* حقل التعليق */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            تعليقك (اختياري)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="شاركنا رأيك حول المنتج (بحد أقصى 500 حرف)"
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl transition shadow-sm text-gray-800 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ borderRadius: 'var(--border-radius)' }}
            maxLength={500}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          disabled={loading || rating === 0}
        >
          إرسال التقييم
        </Button>
      </form>
    </div>
  );
};

export default ReviewForm;