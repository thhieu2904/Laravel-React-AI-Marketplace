import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { PublicLayout } from "@/layouts";
import AdminLayout from "@/layouts/AdminLayout";
import { useAuthStore, useCartStore } from "@/store";

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

// Admin Pages
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminReviews from "@/pages/admin/AdminReviews";
import AdminCategories from "@/pages/admin/AdminCategories";
import ProductEditor from "@/pages/admin/ProductEditor";

// Placeholder pages
const Settings = () => (
  <div>
    <h2 className="text-xl font-bold">Cài đặt</h2>
    <p className="text-muted-foreground mt-2">Tính năng đang phát triển...</p>
  </div>
);
const AdminSettings = () => (
  <div className="text-white">
    <h2 className="text-xl font-bold">Cài đặt hệ thống</h2>
    <p className="text-slate-400 mt-2">Tính năng đang phát triển...</p>
  </div>
);
const AdminCustomers = () => (
  <div className="text-white">
    <h2 className="text-xl font-bold">Quản lý khách hàng</h2>
    <p className="text-slate-400 mt-2">Tính năng đang phát triển...</p>
  </div>
);
const NotFound = () => (
  <div className="container mx-auto px-4 py-16 text-center">
    <h1 className="text-4xl font-bold mb-4">404</h1>
    <p className="text-muted-foreground">Trang không tồn tại</p>
  </div>
);

function App() {
  const { token, fetchProfile } = useAuthStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchCart();
    }
  }, [token, fetchProfile, fetchCart]);

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
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<ProductEditor />} />
          <Route path="products/:id/edit" element={<ProductEditor />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
