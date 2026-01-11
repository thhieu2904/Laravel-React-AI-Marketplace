# Website Thương Mại Điện Tử Sản Phẩm Điện Lạnh

Hệ thống website thương mại điện tử chuyên về các sản phẩm điện lạnh, được xây dựng theo kiến trúc Client-Server với RESTful API.

## Mục lục

1. [Tổng quan](#tổng-quan)
2. [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
3. [Công nghệ sử dụng](#công-nghệ-sử-dụng)
4. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
5. [Cài đặt và cấu hình](#cài-đặt-và-cấu-hình)
6. [Chức năng chính](#chức-năng-chính)
7. [API Documentation](#api-documentation)
8. [Tài khoản thử nghiệm](#tài-khoản-thử-nghiệm)

## Tổng quan

Dự án xây dựng một nền tảng thương mại điện tử hoàn chỉnh cho việc mua bán các sản phẩm điện lạnh bao gồm máy lạnh, tủ lạnh, máy giặt và quạt điện. Hệ thống hỗ trợ đầy đủ các chức năng từ duyệt sản phẩm, quản lý giỏ hàng, đặt hàng đến thanh toán trực tuyến và tích hợp chatbot AI hỗ trợ khách hàng.

## Kiến trúc hệ thống

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

### Các dịch vụ tích hợp

| Dịch vụ        | Mục đích                             |
| -------------- | ------------------------------------ |
| MySQL 8.0      | Cơ sở dữ liệu chính                  |
| Cloudinary     | Lưu trữ và quản lý hình ảnh sản phẩm |
| Google Gemini  | Chatbot AI hỗ trợ khách hàng         |
| SePay (VietQR) | Cổng thanh toán trực tuyến           |

## Công nghệ sử dụng

### Backend

| Thành phần     | Công nghệ            | Phiên bản |
| -------------- | -------------------- | --------- |
| Framework      | Laravel              | 12.x      |
| Ngôn ngữ       | PHP                  | 8.2+      |
| Authentication | JWT (tymon/jwt-auth) | 2.x       |
| Database       | MySQL                | 8.0       |
| ORM            | Eloquent             | -         |

### Frontend

| Thành phần       | Công nghệ            | Phiên bản |
| ---------------- | -------------------- | --------- |
| Framework        | React                | 19.x      |
| Language         | TypeScript           | 5.x       |
| Build Tool       | Vite                 | 7.x       |
| State Management | Zustand              | 5.x       |
| HTTP Client      | Axios                | 1.x       |
| UI Components    | shadcn/ui + Radix UI | -         |
| Styling          | Tailwind CSS         | 4.x       |
| Routing          | React Router         | 7.x       |

## Cấu trúc thư mục

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
│   │   └── api.php            # API routes
│   └── .env                   # Environment configuration
│
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Customer pages + Admin pages
│   │   ├── layouts/           # Layout components
│   │   ├── services/          # API services
│   │   ├── store/             # Zustand stores
│   │   ├── types/             # TypeScript definitions
│   │   └── lib/               # Utilities
│   └── package.json
│
└── BaoCao/                    # Tài liệu báo cáo
```

## Cài đặt và cấu hình

### Yêu cầu hệ thống

- PHP 8.2 trở lên
- Composer 2.x
- Node.js 18.x trở lên
- MySQL 8.0
- Git

### Cài đặt Backend

```bash
cd backend

# Cài đặt dependencies
composer install

# Tạo file cấu hình
cp .env.example .env

# Tạo application key
php artisan key:generate

# Tạo JWT secret
php artisan jwt:secret

# Chạy database migrations
php artisan migrate

# Khởi động server
php artisan serve
```

### Cài đặt Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Tạo file cấu hình
cp .env.example .env

# Khởi động development server
npm run dev
```

### Cấu hình Environment Variables

#### Backend (.env)

```env
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dienlanh_shop
DB_USERNAME=root
DB_PASSWORD=

# JWT
JWT_SECRET=<secret_key>

# CORS
FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>

# Gemini AI
GEMINI_API_KEY=<api_key>

# SePay Payment
PAYMENT_PROVIDER=sepay
SEPAY_MERCHANT_ID=<merchant_id>
SEPAY_SECRET_KEY=<secret_key>
SEPAY_BANK_ACCOUNT=<account_number>
SEPAY_BANK_NAME=TPBank
```

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api
```

### Ports và URLs

| Service     | URL                       | Mô tả                    |
| ----------- | ------------------------- | ------------------------ |
| Frontend    | http://localhost:5173     | React Development Server |
| Backend API | http://localhost:8000/api | Laravel API              |
| MySQL       | localhost:3306            | Database Server          |

## Chức năng chính

### Phía khách hàng

- Đăng ký và đăng nhập tài khoản (JWT Authentication)
- Duyệt sản phẩm theo danh mục
- Tìm kiếm, lọc và sắp xếp sản phẩm
- Xem chi tiết sản phẩm
- Quản lý giỏ hàng
- Đặt hàng với nhiều phương thức thanh toán (COD, chuyển khoản, thanh toán trực tuyến)
- Theo dõi trạng thái đơn hàng
- Đánh giá sản phẩm
- Chat hỗ trợ với AI

### Phía quản trị viên

- Dashboard thống kê tổng quan
- Quản lý danh mục sản phẩm (cấu trúc cây)
- Quản lý sản phẩm (CRUD, upload hình ảnh qua Cloudinary)
- Quản lý đơn hàng (xem, cập nhật trạng thái)
- Quản lý khách hàng (xem, khóa tài khoản)
- Quản lý đánh giá (duyệt, từ chối)
- Thống kê doanh thu theo thời gian

## API Documentation

### Tổng quan

- **Base URL**: `http://localhost:8000/api`
- **Format**: JSON
- **Authentication**: JWT Bearer Token
- **Tổng số endpoints**: 50+

### Các nhóm API chính

| Nhóm     | Prefix        | Mô tả                                |
| -------- | ------------- | ------------------------------------ |
| Public   | `/public/*`   | API công khai không cần xác thực     |
| Customer | `/customer/*` | API dành cho khách hàng đã đăng nhập |
| Cart     | `/cart/*`     | Quản lý giỏ hàng                     |
| Orders   | `/orders/*`   | Quản lý đơn hàng                     |
| Payment  | `/payment/*`  | Xử lý thanh toán                     |
| Chat     | `/chat/*`     | Chatbot AI                           |
| Admin    | `/admin/*`    | API quản trị                         |

Chi tiết API được mô tả trong thư mục `BaoCao/03_API_VA_CHUC_NANG.md`.

## Tài khoản thử nghiệm

### Admin

- **Email**: admin@dienlanh.com
- **Password**: admin123

### Khách hàng

- **Email**: customer@example.com
- **Password**: password123

## Tài liệu tham khảo

- Tài liệu chi tiết về hệ thống nằm trong thư mục `BaoCao/`:
  - `01_TONG_QUAN_HE_THONG.md`: Tổng quan kiến trúc
  - `02_CAU_TRUC_BACKEND.md`: Cấu trúc backend chi tiết
  - `03_API_VA_CHUC_NANG.md`: Danh sách API và chức năng
  - `04_LUONG_GIAO_TIEP.md`: Luồng giao tiếp giữa các thành phần
  - `05_TAI_KHOAN_TEST_VA_SCHEMA.md`: Schema database và dữ liệu test

## Giấy phép

Dự án được phát triển cho mục đích học tập và nghiên cứu.
