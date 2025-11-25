import React, { useState } from 'react';
import { productApi } from '../../api/productApi';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Star, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const ReviewForm = ({ productId, onReviewAdded }) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  if (!isAuthenticated) {
    return (
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/50 p-4 shadow-sm">
        <p className="text-yellow-800 dark:text-yellow-400 font-medium flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {t('product.login_to_review') || 'Please log in to add a review.'}
        </p>
      </Card>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error(t('product.comment_required') || 'Please write a comment');
      return;
    }

    setIsSubmitting(true);
    try {
      await productApi.addReview(productId, { rating, comment });
      toast.success(t('product.thank_you_review') || 'Thank you for your review!');

      // إعادة تعيين النموذج
      setComment('');
      setRating(5);

      if (onReviewAdded) onReviewAdded(); // تحديث القائمة في المكون الأب
    } catch (error) {
      toast.error(error.response?.data?.error || t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* قسم التقييم بالنجوم */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('product.your_rating') || 'Your Rating'}
            </label>
            <div className="flex space-x-1 rtl:space-x-reverse">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  className="focus:outline-none"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Star
                    className={`h-7 w-7 transition-colors duration-200 ${
                      (hoverRating || rating) >= star
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </motion.button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ({rating} {t('common.stars') || 'stars'})
            </p>
          </div>

          {/* قسم التعليق */}
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('product.your_comment') || 'Your Comment'}
            </label>
            <textarea
              id="comment"
              rows="3"
              className="w-full px-4 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              placeholder={t('product.comment_placeholder') || 'Share your experience with the product...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            ></textarea>
          </div>

          <Button type="submit" isLoading={isSubmitting} className="w-full shadow-md shadow-primary-500/20">
            {t('product.post_review') || 'Post Review'}
          </Button>
        </form>
      </Card>
    </motion.div>
  );
};

export default ReviewForm;