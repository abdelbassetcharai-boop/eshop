import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSystem } from "../context/SystemContext";
import { productApi } from "../api/productApi";
import Button from "../components/ui/Button";
import ProductList from "../features/products/ProductList";
import Spinner from "../components/ui/Spinner";

const HomePage = () => {
  const { banners, loading: systemLoading } = useSystem();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // جلب أحدث 4 منتجات كمنتجات مميزة
        const res = await productApi.getAll({ limit: 4 });
        if (res.success) {
          setFeaturedProducts(res.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchFeatured();
  }, []);

  if (systemLoading || loadingProducts)
    return (
      <div className="py-20">
        <Spinner size="lg" />
      </div>
    );

  // استخدام أول بنر كصورة رئيسية، أو صورة افتراضية إذا لم يوجد
  const heroBanner = banners.length > 0 ? banners[0] : null;
  const heroImage = heroBanner
    ? heroBanner.image_url.startsWith("http")
      ? heroBanner.image_url
      : `${import.meta.env.VITE_API_URL.replace("/api", "")}${
          heroBanner.image_url
        }`
    : "https://images.unsplash.com/photo-1557821552-17105176677c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80";

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-xl h-[500px]">
        <div className="absolute inset-0">
          <img
            className="h-full w-full object-cover opacity-40"
            src={heroImage}
            alt="Hero Background"
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 flex flex-col justify-center h-full">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {heroBanner ? heroBanner.title : "أحدث الإلكترونيات العصرية"}
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl">
            اكتشف تشكيلتنا الجديدة بأفضل الأسعار. جودة عالية، ضمان حقيقي، وتوصيل
            سريع لباب منزلك.
          </p>
          <div className="mt-10">
            <Link to="/shop">
              <Button size="lg" className="px-8 py-3 text-lg font-bold">
                تسوق الآن
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-3xl font-bold text-gray-900">منتجات مميزة</h2>
          <Link
            to="/shop"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            عرض الكل &rarr;
          </Link>
        </div>
        <ProductList products={featuredProducts} />
      </section>

      {/* Categories / Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "شحن سريع", desc: "توصيل خلال 2-4 أيام عمل", icon: "🚚" },
          {
            title: "دفع آمن",
            desc: "حماية كاملة لبياناتك المالية",
            icon: "🔒",
          },
          {
            title: "دعم فني",
            desc: "متواجدون لخدمتك على مدار الساعة",
            icon: "🎧",
          },
        ].map((feature, idx) => (
          <div
            key={idx}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-500">{feature.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default HomePage;
