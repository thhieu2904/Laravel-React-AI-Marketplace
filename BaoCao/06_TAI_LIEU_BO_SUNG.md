# TÀI LIỆU BỔ SUNG CHO BÁO CÁO

## 1. Frontend Architecture

### 1.1 Cấu trúc thư mục Frontend

```
frontend/src/
├── components/           # 32 Reusable components
│   ├── layout/           # Header, Footer, Sidebar, etc.
│   ├── ui/               # UI components (Button, Input, Modal, etc.)
│   ├── product/          # ProductCard, ProductGrid, etc.
│   ├── cart/             # CartItem, CartSummary, etc.
│   └── chat/             # ChatWidget, ChatMessage, etc.
│
├── pages/                # 25 Page components
│   ├── Home.tsx          # Trang chủ
│   ├── Products.tsx      # Danh sách sản phẩm
│   ├── ProductDetail.tsx # Chi tiết sản phẩm
│   ├── Category.tsx      # Sản phẩm theo danh mục
│   ├── Cart.tsx          # Giỏ hàng
│   ├── Checkout.tsx      # Thanh toán
│   ├── Login.tsx         # Đăng nhập
│   ├── Register.tsx      # Đăng ký
│   ├── Account.tsx       # Tài khoản (layout)
│   ├── Profile.tsx       # Thông tin cá nhân
│   ├── Orders.tsx        # Danh sách đơn hàng
│   ├── OrderDetail.tsx   # Chi tiết đơn hàng
│   ├── MyReviews.tsx     # Đánh giá của tôi
│   ├── Settings.tsx      # Cài đặt
│   ├── About.tsx         # Giới thiệu
│   ├── Contact.tsx       # Liên hệ
│   └── admin/            # 9 Admin pages
│       ├── AdminLogin.tsx
│       ├── AdminDashboard.tsx
│       ├── AdminProducts.tsx
│       ├── ProductEditor.tsx
│       ├── AdminCategories.tsx
│       ├── AdminOrders.tsx
│       ├── AdminOrderDetail.tsx
│       ├── AdminCustomers.tsx
│       └── AdminReviews.tsx
│
├── layouts/              # 3 Layout components
│   ├── PublicLayout.tsx  # Layout cho customer pages
│   ├── AdminLayout.tsx   # Layout cho admin pages
│   └── index.ts
│
├── services/             # API services
│   ├── api.ts            # Axios instance + interceptors
│   ├── auth.service.ts   # Auth API calls
│   ├── cart.service.ts   # Cart API calls
│   ├── product.service.ts# Product API calls
│   └── index.ts
│
├── store/                # Zustand state management
│   ├── authStore.ts      # Customer auth state
│   ├── adminAuthStore.ts # Admin auth state
│   ├── cartStore.ts      # Cart state
│   ├── sessionStore.ts   # Session expired modal state
│   └── index.ts
│
├── types/                # TypeScript definitions
│   ├── product.ts
│   ├── order.ts
│   ├── user.ts
│   ├── cart.ts
│   └── index.ts
│
├── lib/                  # Utilities
│   └── utils.ts          # Helper functions
│
├── App.tsx               # Root component + Routes
├── main.tsx              # Entry point
└── index.css             # Global styles
```

### 1.2 State Management (Zustand)

```typescript
// authStore - Quản lý auth state của Customer
interface AuthState {
  token: string | null;
  user: Customer | null;
  isLoading: boolean;
  login: (credentials) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

// cartStore - Quản lý giỏ hàng
interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId, quantity) => Promise<void>;
  updateItem: (itemId, quantity) => Promise<void>;
  removeItem: (itemId) => Promise<void>;
  clearCart: () => Promise<void>;
}

// adminAuthStore - Quản lý auth state của Admin
interface AdminAuthState {
  token: string | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  login: (credentials) => Promise<void>;
  logout: () => void;
}
```

### 1.3 Routing Structure

```
Customer Routes (PublicLayout):
├── /                      → Home
├── /san-pham              → Products
├── /san-pham/:slug        → ProductDetail
├── /danh-muc/:slug        → Category
├── /gio-hang              → Cart
├── /thanh-toan            → Checkout
├── /dang-nhap             → Login
├── /dang-ky               → Register
├── /gioi-thieu            → About
├── /lien-he               → Contact
└── /tai-khoan             → Account (protected)
    ├── /                  → Profile
    ├── /don-hang          → Orders
    ├── /don-hang/:code    → OrderDetail
    ├── /danh-gia          → MyReviews
    └── /cai-dat           → Settings

Admin Routes (AdminLayout):
├── /admin/login           → AdminLogin
└── /admin                 → (protected)
    ├── /                  → Dashboard
    ├── /categories        → AdminCategories
    ├── /products          → AdminProducts
    ├── /products/new      → ProductEditor
    ├── /products/:id/edit → ProductEditor
    ├── /orders            → AdminOrders
    ├── /orders/:id        → AdminOrderDetail
    ├── /customers         → AdminCustomers
    ├── /reviews           → AdminReviews
    └── /settings          → AdminSettings
```

---

## 2. Security Features

### 2.1 Authentication

| Feature          | Implementation        |
| ---------------- | --------------------- |
| Password Hashing | bcrypt (12 rounds)    |
| Token Type       | JWT (JSON Web Token)  |
| Token Expiry     | 1 hour (configurable) |
| Refresh Token    | ✅ Supported          |
| Separate Guards  | Admin / Customer      |

### 2.2 API Security

| Feature          | Implementation                     |
| ---------------- | ---------------------------------- |
| CORS             | Whitelist frontend URL             |
| Rate Limiting    | Laravel throttle middleware        |
| Input Validation | Laravel Form Request               |
| SQL Injection    | Eloquent ORM (prepared statements) |
| XSS Protection   | Laravel auto-escaping              |

### 2.3 Payment Security

| Feature              | Implementation                  |
| -------------------- | ------------------------------- |
| Webhook Verification | Signature validation            |
| Idempotency          | request_id unique constraint    |
| Amount Verification  | Compare order vs webhook amount |
| HTTPS Only           | Production requirement          |

---

## 3. Tích hợp Bên thứ ba

### 3.1 Cloudinary (Image Storage)

- **Mục đích**: Lưu trữ và tối ưu hóa hình ảnh sản phẩm
- **Features sử dụng**:
  - Direct upload từ frontend
  - CDN delivery
  - Image transformation (resize, crop)
  - Lazy loading support

### 3.2 Google Gemini (AI Chatbot)

- **Model**: gemini-1.5-flash (hoặc gemini-pro)
- **Features**:
  - Tư vấn sản phẩm
  - Trả lời FAQ về cửa hàng
  - Context-aware (nhớ lịch sử chat)
  - Streaming response (SSE)

### 3.3 SePay (Payment Gateway)

- **Phương thức**: Bank Transfer via VietQR
- **Flow**:
  1. Generate QR code với nội dung chuyển khoản
  2. User quét QR và chuyển khoản
  3. SePay gửi webhook khi nhận được tiền
  4. Backend verify và cập nhật order

---

## 4. Performance Optimizations

### 4.1 Backend

| Optimization  | Description                        |
| ------------- | ---------------------------------- |
| Eager Loading | Avoid N+1 queries với `with()`     |
| Pagination    | Limit data returned                |
| Indexing      | Category, status, featured columns |
| Query Scopes  | Reusable query logic               |

### 4.2 Frontend

| Optimization       | Description                  |
| ------------------ | ---------------------------- |
| Code Splitting     | Lazy loading routes          |
| Vite HMR           | Fast development             |
| Axios Interceptors | Centralized error handling   |
| Zustand            | Lightweight state management |

---

## 5. Testing Scenarios

### 5.1 Customer Flow Tests

| #   | Test Case         | Steps                                        |
| --- | ----------------- | -------------------------------------------- |
| 1   | Register          | Fill form → Submit → Verify redirect         |
| 2   | Login             | Enter credentials → Verify token stored      |
| 3   | Browse            | Navigate categories → Filter → Sort          |
| 4   | Cart              | Add items → Update quantity → Remove         |
| 5   | Checkout (COD)    | Fill shipping → Place order → Verify success |
| 6   | Checkout (Online) | Select online → Scan QR → Simulate webhook   |
| 7   | Order tracking    | View orders → Check status changes           |
| 8   | Review            | Write review → Wait approval → View          |

### 5.2 Admin Flow Tests

| #   | Test Case         | Steps                                      |
| --- | ----------------- | ------------------------------------------ |
| 1   | Login             | Enter admin credentials → Access dashboard |
| 2   | Dashboard         | Verify stats loaded correctly              |
| 3   | Manage Products   | Create → Edit → Toggle status → Delete     |
| 4   | Manage Categories | Create tree → Edit → Delete                |
| 5   | Manage Orders     | View list → Update status                  |
| 6   | Manage Reviews    | Approve → Reject → Delete                  |
| 7   | Manage Customers  | View list → Toggle status                  |

---

## 6. Deployment Guide

### 6.1 Requirements

| Component | Requirement |
| --------- | ----------- |
| PHP       | 8.2+        |
| Node.js   | 18+         |
| MySQL     | 8.0+        |
| Composer  | 2.x         |
| npm       | 9+          |

### 6.2 Backend Setup

```bash
# Clone & install
cd backend
composer install

# Environment
cp .env.example .env
php artisan key:generate
php artisan jwt:secret

# Database
php artisan migrate
mysql -u root dienlanh_shop < docs/seed.sql

# Run
php artisan serve
```

### 6.3 Frontend Setup

```bash
# Clone & install
cd frontend
npm install

# Environment
cp .env.example .env

# Run
npm run dev
```

### 6.4 Production Deployment

```bash
# Backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Frontend
npm run build
# Deploy dist/ to static hosting (Vercel, Netlify, etc.)
```

---

## 7. Known Limitations

1. **No real-time updates**: Orders/chat không tự động refresh (cần polling)
2. **Single language**: Chỉ hỗ trợ tiếng Việt
3. **No inventory alerts**: Không có cảnh báo hết hàng
4. **Basic search**: Không có full-text search
5. **No email notifications**: Chưa gửi email xác nhận đơn

---

## 8. Future Improvements

1. **WebSocket**: Real-time order updates
2. **Elasticsearch**: Advanced product search
3. **Multi-language**: i18n support
4. **Push notifications**: Order status updates
5. **Analytics**: Google Analytics integration
6. **More payment methods**: VNPay, MoMo, ZaloPay
7. **Wishlist**: Save favorite products
8. **Coupons/Discounts**: Promotion system
