import React, { useState } from 'react';
import { productApi } from '../../api/productApi';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { Star } from 'lucide-react';
import { toast } from 'react-toastify';

const ReviewForm = ({ productId, onReviewAdded }) => {
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  if (!isAuthenticated) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
        الرجاء تسجيل الدخول لتتمكن من إضافة تقييم.
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('الرجاء كتابة تعليق');
      return;
    }

    setIsSubmitting(true);
    try {
      await productApi.addReview(productId, { rating, comment });
      toast.success('شكراً لتقييمك!');
      setComment('');
      setRating(5);
      if (onReviewAdded) onReviewAdded(); // تحديث القائمة في المكون الأب
    } catch (error) {
      toast.error(error.response?.data?.error || 'حدث خطأ أثناء إرسال التقييم');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">تقييمك</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none transition-transform hover:scale-110"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <Star
                className={`h-6 w-6 ${(hoverRating || rating) >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          تعليقك
        </label>
        <textarea
          id="comment"
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="أخبرنا عن تجربتك مع المنتج..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        ></textarea>
      </div>

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        نشر التقييم
      </Button>
    </form>
  );
};

export default ReviewForm;