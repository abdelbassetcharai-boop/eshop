import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, CreditCard, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useTranslation();

  const currentYear = new Date().getFullYear();

  // مصفوفة الميزات (نستخدم t داخلها لترجمة النصوص)
  const features = [
    { icon: Truck, title: t('footer.features.shipping_title'), desc: t('footer.features.shipping_desc') },
    { icon: ShieldCheck, title: t('footer.features.warranty_title'), desc: t('footer.features.warranty_desc') },
    { icon: CreditCard, title: t('footer.features.payment_title'), desc: t('footer.features.payment_desc') },
    { icon: RotateCcw, title: t('footer.features.return_title'), desc: t('footer.features.return_desc') },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      {/* القسم العلوي: الميزات (Top Features) */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                <div className="p-3 bg-primary-500/10 rounded-full text-primary-500">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">{item.title}</h4>
                  <p className="text-slate-400 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* القسم الرئيسي (Main Content) */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* العمود 1: عن المتجر */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                E
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-none">EShop</h3>
                <span className="text-[10px] font-medium text-slate-500 tracking-widest uppercase">Premium Store</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              {t('footer.about_text')}
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="p-2 rounded-full bg-slate-800 text-slate-400 hover:bg-primary-600 hover:text-white transition-all transform hover:scale-110"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-full bg-slate-800 text-slate-400 hover:bg-sky-500 hover:text-white transition-all transform hover:scale-110"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-full bg-slate-800 text-slate-400 hover:bg-pink-600 hover:text-white transition-all transform hover:scale-110"><Instagram className="w-4 h-4" /></a>
            </div>
          </div>

          {/* العمود 2: روابط سريعة */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-6 relative inline-block">
              {t('footer.quick_links')}
              <span className="absolute -bottom-2 right-0 rtl:left-0 rtl:right-auto w-8 h-0.5 bg-primary-500 rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-primary-400 hover:translate-x-1 rtl:hover:-translate-x-1 transition-all inline-block">{t('footer.links.about')}</Link></li>
              <li><Link to="/shop" className="hover:text-primary-400 hover:translate-x-1 rtl:hover:-translate-x-1 transition-all inline-block">{t('footer.links.products')}</Link></li>
              <li><Link to="/offers" className="hover:text-primary-400 hover:translate-x-1 rtl:hover:-translate-x-1 transition-all inline-block">{t('footer.links.offers')}</Link></li>
              <li><Link to="/register-vendor" className="hover:text-primary-400 hover:translate-x-1 rtl:hover:-translate-x-1 transition-all inline-block text-secondary-400">{t('footer.links.become_vendor')}</Link></li>
            </ul>
          </div>

          {/* العمود 3: الدعم */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-6 relative inline-block">
              {t('footer.support_center')}
              <span className="absolute -bottom-2 right-0 rtl:left-0 rtl:right-auto w-8 h-0.5 bg-primary-500 rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/track-order" className="hover:text-primary-400 hover:translate-x-1 rtl:hover:-translate-x-1 transition-all inline-block">{t('footer.links.track_order')}</Link></li>
              <li><Link to="/return-policy" className="hover:text-primary-400 hover:translate-x-1 rtl:hover:-translate-x-1 transition-all inline-block">{t('footer.links.return_policy')}</Link></li>
              <li><Link to="/shipping-info" className="hover:text-primary-400 hover:translate-x-1 rtl:hover:-translate-x-1 transition-all inline-block">{t('footer.links.shipping_info')}</Link></li>
              <li><Link to="/faq" className="hover:text-primary-400 hover:translate-x-1 rtl:hover:-translate-x-1 transition-all inline-block">{t('footer.links.faq')}</Link></li>
            </ul>
          </div>

          {/* العمود 4: التواصل */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-6 relative inline-block">
              {t('footer.contact_us')}
              <span className="absolute -bottom-2 right-0 rtl:left-0 rtl:right-auto w-8 h-0.5 bg-primary-500 rounded-full"></span>
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                <span>{t('footer.contact.address_city')}<br/><span className="text-slate-500 text-xs">{t('footer.contact.hq')}</span></span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <a href="mailto:support@eshop.com" className="hover:text-white transition-colors">support@eshop.com</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <span dir="ltr">+966 50 000 0000</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* الشريط السفلي (Bottom Bar) */}
      <div className="border-t border-slate-800 bg-slate-950 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500 text-center md:text-right">
            &copy; {currentYear} EShop. {t('footer.rights_reserved')}
          </p>

          <div className="flex gap-2">
             {/* محاكاة أيقونات الدفع */}
             {['visa', 'mastercard', 'paypal', 'apple-pay'].map((payment) => (
               <div key={payment} className="h-8 w-12 bg-white rounded flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
                 <span className="text-[10px] font-bold text-slate-800 uppercase">{payment.split('-')[0]}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;