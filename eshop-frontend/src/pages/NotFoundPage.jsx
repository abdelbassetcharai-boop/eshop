import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <AlertTriangle className="h-24 w-24 text-yellow-500 mb-6" />
      <h1 className="text-6xl font-extrabold text-gray-900 mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">الصفحة غير موجودة</h2>
      <p className="text-gray-500 max-w-md mb-8">
        عذراً، الصفحة التي تبحث عنها قد تكون حذفت، تغير اسمها، أو غير متاحة مؤقتاً.
      </p>
      <Link to="/">
        <Button size="lg">العودة للصفحة الرئيسية</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;