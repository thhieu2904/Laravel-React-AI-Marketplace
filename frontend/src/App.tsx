import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { PublicLayout } from "@/layouts";
import AdminLayout from "@/layouts/AdminLayout";
import { useAuthStore, useCartStore } from "@/store";
import SessionExpiredModal from "@/components/layout/SessionExpiredModal";

// Customer Pages
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Category from "@/pages/Category";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Account from "@/pages/Account";
import Profile from "@/pages/Profile";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import MyReviews from "@/pages/MyReviews";
import About from "@/pages/About";
import Contact from "@/pages/Contact";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminReviews from "@/pages/admin/AdminReviews";
import AdminCategories from "@/pages/admin/AdminCategories";
import ProductEditor from "@/pages/admin/ProductEditor";
import AdminOrderDetail from "@/pages/admin/AdminOrderDetail";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import Settings from "@/pages/Settings";

// Placeholder pages
const AdminSettings = () => (
  <div className="p-6">
    <h2 className="text-xl font-bold text-gray-900">Cài đặt hệ thống</h2>
    <p className="text-gray-500 mt-2">Tính năng đang phát triển...</p>
  </div>
);
const NotFound = () => (
  <div className="container mx-auto px-4 py-16 text-center">
    <h1 className="text-4xl font-bold mb-4">404</h1>
    <p className="text-muted-foreground">Trang không tồn tại</p>
  </div>
);

function App() {
  const { token, isAuthenticated, fetchProfile } = useAuthStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    // Don't auto-fetch on mount with persisted token
    // Only fetch when user explicitly logs in (isAuthenticated will be set to true)
    // This prevents 401 errors from expired tokens on page reload
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Layout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/san-pham" element={<Products />} />
          <Route path="/san-pham/:slug" element={<ProductDetail />} />
          <Route path="/danh-muc/:slug" element={<Category />} />
          <Route path="/gio-hang" element={<Cart />} />
          <Route path="/thanh-toan" element={<Checkout />} />
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/dang-ky" element={<Register />} />
          <Route path="/gioi-thieu" element={<About />} />
          <Route path="/lien-he" element={<Contact />} />

          {/* Account Routes */}
          <Route path="/tai-khoan" element={<Account />}>
            <Route index element={<Profile />} />
            <Route path="don-hang" element={<Orders />} />
            <Route path="don-hang/:orderCode" element={<OrderDetail />} />
            <Route path="danh-gia" element={<MyReviews />} />
            <Route path="cai-dat" element={<Settings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<ProductEditor />} />
          <Route path="products/:id/edit" element={<ProductEditor />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
      <SessionExpiredModal />
    </BrowserRouter>
  );
}

export default App;
