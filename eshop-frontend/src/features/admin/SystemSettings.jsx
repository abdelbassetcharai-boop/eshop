import React from 'react';
import Button from '../../components/ui/Button';

const SystemSettings = () => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">إعدادات النظام</h2>

      <div className="py-10 text-center">
        <p className="text-gray-500">هذه الميزة قيد التطوير حالياً.</p>
        <p className="text-sm text-gray-400 mt-2">ستتمكن هنا من تغيير اسم الموقع، العملة، وحالة الصيانة.</p>

        <div className="mt-6">
           <Button disabled>حفظ الإعدادات</Button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;