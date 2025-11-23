import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
// استيراد جميع مزودات السياق (Context Providers)
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { SystemProvider } from './context/SystemContext.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* إضافة أعلام المستقبل لإسكات تحذيرات React Router v7 */}
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <SystemProvider> {/* ضروري لعمل HomePage */}
          <CartProvider> {/* ضروري لعمل Header و CartPage */}
            <App />
            <ToastContainer position="bottom-right" autoClose={3000} />
          </CartProvider>
        </SystemProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);