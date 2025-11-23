import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // حساب عدد العناصر في السلة
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* الشعار */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <h1 className="text-2xl font-bold text-indigo-600">EShop</h1>
          </div>

          {/* القائمة الرئيسية (سطح المكتب) */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            <Link to="/shop" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
              Shop
            </Link>
          </nav>

          {/* أيقونات الإجراءات */}
          <div className="flex items-center space-x-4">

            {/* السلة */}
            <Link to="/cart" className="relative text-gray-700 hover:text-indigo-600 p-2">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* روابط المستخدم */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-4 ml-4">
                {user?.role === 'admin' && (
                   <Link to="/admin/dashboard" className="text-gray-600 hover:text-indigo-600" title="Admin Dashboard">
                     <LayoutDashboard className="h-5 w-5" />
                   </Link>
                )}

                <Link to="/profile" className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600">
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">{user?.name}</span>
                </Link>

                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex space-x-2 items-center">
                <Link to="/login" className="text-gray-700 hover:text-indigo-600 font-medium text-sm px-3 py-2">Login</Link>
                <span className="text-gray-300">|</span>
                <Link to="/register" className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">Register</Link>
              </div>
            )}

            {/* زر القائمة للموبايل */}
            <button
              className="md:hidden text-gray-700 p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* قائمة الموبايل */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 pb-4">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Home</Link>
            <Link to="/shop" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Shop</Link>
            {isAuthenticated && (
              <>
                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">My Profile</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Dashboard</Link>
                )}
                <button onClick={logout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Logout</button>
              </>
            )}
            {!isAuthenticated && (
               <div className="mt-4 flex flex-col space-y-2 px-3">
                 <Link to="/login" className="block text-center w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium">Login</Link>
                 <Link to="/register" className="block text-center w-full bg-indigo-600 text-white px-4 py-2 rounded-md font-medium">Register</Link>
               </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;