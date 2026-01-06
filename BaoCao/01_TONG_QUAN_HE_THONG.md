# TỔNG QUAN HỆ THỐNG

## 1. Giới thiệu

**Website Bán Điện Lạnh** là hệ thống thương mại điện tử (E-commerce) chuyên về các sản phẩm điện lạnh như máy lạnh, tủ lạnh, máy giặt, quạt điện. Hệ thống được xây dựng theo kiến trúc **Client-Server** với **RESTful API**.

---

## 2. Kiến trúc Tổng quan

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Client)                          │
│               React 18 + TypeScript + Vite                         │
│                    http://localhost:5173                           │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                          HTTP/HTTPS (REST API)
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                         BACKEND (Server)                           │
│                Laravel 12 + PHP 8.2+                               │
│                   http://localhost:8000                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     Controllers Layer                        │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │   │
│  │  │  Auth    │ │  Public  │ │ Customer │ │    Admin     │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     Services Layer                           │   │
│  │         PaymentService  │  GeminiService (AI Chat)           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     Models Layer (ORM)                       │   │
│  │    13 Eloquent Models với relationships và scopes            │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                          MySQL Protocol
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                         DATABASE                                   │
│                    MySQL 8.0 (InnoDB)                              │
│                   Database: dienlanh_shop                          │
│                        13 Tables                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Công nghệ Sử dụng

### 3.1 Backend

| Thành phần      | Công nghệ            | Phiên bản |
| --------------- | -------------------- | --------- |
| Framework       | Laravel              | 12.x      |
| Ngôn ngữ        | PHP                  | 8.2+      |
| Authentication  | JWT (tymon/jwt-auth) | 2.x       |
| Database        | MySQL                | 8.0       |
| ORM             | Eloquent             | -         |
| Image Storage   | Cloudinary           | API       |
| AI Chatbot      | Google Gemini        | API       |
| Payment Gateway | SePay (VietQR)       | API       |

### 3.2 Frontend

| Thành phần       | Công nghệ    | Phiên bản |
| ---------------- | ------------ | --------- |
| Framework        | React        | 18.x      |
| Language         | TypeScript   | 5.x       |
| Build Tool       | Vite         | 5.x       |
| State Management | Zustand      | 4.x       |
| HTTP Client      | Axios        | 1.x       |
| UI Components    | shadcn/ui    | -         |
| Styling          | Tailwind CSS | 3.x       |
| Icons            | Lucide React | -         |
| Routing          | React Router | 6.x       |

---

## 4. Cấu trúc Thư mục Dự án

```
WEBSITE_DIENLANH/
├── backend/                   # Laravel Backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/   # 17 Controllers
│   │   │   └── Middleware/
│   │   ├── Models/            # 13 Models
│   │   ├── Services/          # PaymentService, GeminiService
│   │   └── Providers/
│   ├── config/                # Configuration files
│   ├── database/
│   │   ├── migrations/        # Database migrations
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php            # 188 lines API routes
│   ├── storage/
│   └── .env                   # Environment configuration
│
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/        # 32 Reusable components
│   │   ├── pages/             # 16 Customer pages + 9 Admin pages
│   │   ├── layouts/           # 3 Layout components
│   │   ├── services/          # 5 API services
│   │   ├── store/             # 5 Zustand stores
│   │   ├── types/             # TypeScript definitions
│   │   └── lib/               # Utilities
│   ├── public/
│   └── package.json
│
├── docs/                      # Documentation
│   ├── schema.sql             # Database schema (262 lines)
│   ├── seed.sql               # Sample data (192 lines)
│   └── plan.md
│
└── BaoCao/                    # Thư mục báo cáo này
```

---

## 5. Tính năng Chính

### 5.1 Phía Khách hàng (Customer)

- ✅ Đăng ký / Đăng nhập (JWT Authentication)
- ✅ Duyệt sản phẩm theo danh mục
- ✅ Tìm kiếm / Lọc / Sắp xếp sản phẩm
- ✅ Xem chi tiết sản phẩm
- ✅ Thêm sản phẩm vào giỏ hàng
- ✅ Thanh toán (COD / Bank Transfer / Online)
- ✅ Theo dõi đơn hàng
- ✅ Đánh giá sản phẩm
- ✅ Chat hỗ trợ với AI (Gemini)

### 5.2 Phía Quản trị (Admin)

- ✅ Dashboard thống kê
- ✅ Quản lý danh mục (CRUD + Tree structure)
- ✅ Quản lý sản phẩm (CRUD + Upload ảnh)
- ✅ Quản lý đơn hàng (Xem / Cập nhật trạng thái)
- ✅ Quản lý khách hàng (Xem / Khóa tài khoản)
- ✅ Quản lý đánh giá (Duyệt / Từ chối)
- ✅ Thống kê doanh thu

---

## 6. Luồng Giao tiếp

```
┌──────────┐        ┌──────────────┐        ┌──────────────┐
│  User    │◄──────►│   Frontend   │◄──────►│   Backend    │
│ (Browser)│  HTML  │  (React)     │  JSON  │  (Laravel)   │
└──────────┘        └──────────────┘        └──────────────┘
                                                   │
                    ┌──────────────────────────────┼─────────┐
                    │                              │         │
              ┌─────▼─────┐  ┌──────────────┐ ┌───▼────┐   │
              │  MySQL    │  │  Cloudinary  │ │ Gemini │   │
              │ Database  │  │  (Images)    │ │  (AI)  │   │
              └───────────┘  └──────────────┘ └────────┘   │
                                                   │         │
                                            ┌──────▼─────┐  │
                                            │   SePay    │  │
                                            │ (Payment)  │  │
                                            └────────────┘  │
                    └────────────────────────────────────────┘
```

---

## 7. Ports & URLs

| Service     | URL                       | Mô tả                    |
| ----------- | ------------------------- | ------------------------ |
| Frontend    | http://localhost:5173     | React Development Server |
| Backend API | http://localhost:8000/api | Laravel API              |
| MySQL       | localhost:3306            | Database Server          |

---

## 8. Environment Variables

### Backend (.env)

```env
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dienlanh_shop

# JWT
JWT_SECRET=<secret_key>

# CORS
FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=djfepoe13
CLOUDINARY_API_KEY=<api_key>

# Gemini AI
GEMINI_API_KEY=<api_key>

# SePay Payment
PAYMENT_PROVIDER=sepay
SEPAY_MERCHANT_ID=<merchant_id>
SEPAY_SECRET_KEY=<secret_key>
SEPAY_BANK_ACCOUNT=<account>
SEPAY_BANK_NAME=TPBank
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api
```
