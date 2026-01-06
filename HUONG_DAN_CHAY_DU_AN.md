# HƯỚNG DẪN CHẠY DỰ ÁN WEBSITE ĐIỆN LẠNH

## 📋 Yêu cầu hệ thống

Trước khi bắt đầu, đảm bảo bạn đã cài đặt:

### 1. XAMPP
- **PHP**: 8.2 hoặc cao hơn
- **MySQL**: 8.0 hoặc cao hơn
- **Apache**: Web server

### 2. Node.js & npm
- **Node.js**: 18.x hoặc cao hơn
- **npm**: 9.x hoặc cao hơn

### 3. Composer
- **Composer**: 2.x (quản lý package PHP)

---

## 🚀 HƯỚNG DẪN CHI TIẾT

### BƯỚC 1: Khởi động XAMPP

1. Mở XAMPP Control Panel
2. Start **Apache** (cho PHP)
3. Start **MySQL** (cho database)

### BƯỚC 2: Tạo Database

1. Mở trình duyệt → `http://localhost/phpmyadmin`
2. Tạo database mới:
   - Tên: `dienlanh_shop`
   - Collation: `utf8mb4_unicode_ci`

### BƯỚC 3: Setup Backend (Laravel)

```bash
# 1. Di chuyển vào thư mục backend
cd c:\xampp\htdocs\WEBSITE_DIENLANH\backend

# 2. Cài đặt dependencies PHP
composer install

# 3. Copy file cấu hình
copy .env.example .env

# 4. Tạo application key
php artisan key:generate

# 5. Cấu hình database trong .env
# Mở file .env và sửa phần database:
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dienlanh_shop
DB_USERNAME=root
DB_PASSWORD=

# 6. Chạy migrations (tạo bảng)
php artisan migrate

# 7. Seed dữ liệu mẫu (tùy chọn)
php artisan db:seed

# 8. Chạy server backend
php artisan serve
```

**Backend sẽ chạy tại:** `http://localhost:8000`

### BƯỚC 4: Setup Frontend (React)

```bash
# 1. Di chuyển vào thư mục frontend
cd c:\xampp\htdocs\WEBSITE_DIENLANH\frontend

# 2. Cài đặt dependencies Node.js
npm install

# 3. Tạo file .env (nếu chưa có)
# Tạo file .env trong thư mục frontend với nội dung:
VITE_API_URL=http://localhost:8000/api

# 4. Chạy development server
npm run dev
```

**Frontend sẽ chạy tại:** `http://localhost:5173`

---

## 🔧 CẤU HÌNH CHI TIẾT

### File .env Backend

```env
APP_NAME="Website Điện Lạnh"
APP_ENV=local
APP_KEY=base64:your_generated_key_here
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dienlanh_shop
DB_USERNAME=root
DB_PASSWORD=

# JWT
JWT_SECRET=your_jwt_secret_here

# External APIs (nếu có)
GEMINI_API_KEY=your_gemini_key
SEPAY_API_KEY=your_sepay_key
CLOUDINARY_API_KEY=your_cloudinary_key
```

### File .env Frontend

```env
VITE_API_URL=http://localhost:8000/api
```

---

## 🧪 KIỂM TRA HOẠT ĐỘNG

### 1. Kiểm tra Backend API
Mở trình duyệt → `http://localhost:8000/api/health`

**Response mong đợi:**
```json
{
    "status": "ok",
    "message": "API is running",
    "timestamp": "2024-01-05..."
}
```

### 2. Kiểm tra Frontend
Mở trình duyệt → `http://localhost:5173`

**Frontend sẽ hiển thị trang chủ website điện lạnh**

### 3. Kiểm tra Database
- Mở phpMyAdmin → `http://localhost/phpmyadmin`
- Chọn database `dienlanh_shop`
- Kiểm tra các bảng đã được tạo:
  - `admins`, `customers`, `categories`, `products`, etc.

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi 1: "composer command not found"
```bash
# Cài đặt Composer
# Download từ: https://getcomposer.org/download/
# Hoặc dùng Chocolatey: choco install composer
```

### Lỗi 2: "php artisan command not found"
```bash
# Đảm bảo PHP đã được thêm vào PATH
# Hoặc dùng đường dẫn đầy đủ:
# c:\xampp\php\php.exe artisan key:generate
```

### Lỗi 3: Database connection failed
```bash
# Kiểm tra:
# 1. MySQL đã start trong XAMPP
# 2. Database name đúng trong .env
# 3. Username/password đúng
```

### Lỗi 4: Port 8000/5173 bị chiếm
```bash
# Thay đổi port:
# Backend: php artisan serve --port=8001
# Frontend: npm run dev -- --port=5174
```

### Lỗi 5: CORS error
```bash
# Thêm vào config/cors.php:
'allowed_origins' => ['http://localhost:5173'],
```

---

## 📱 TRUY CẬP ỨNG DỤNG

Sau khi setup xong:

### Frontend (User Interface)
- **URL**: `http://localhost:5173`
- **Chức năng**: Duyệt sản phẩm, mua hàng, đăng ký/đăng nhập

### Backend API
- **URL**: `http://localhost:8000`
- **API Docs**: `http://localhost:8000/api/health`

### Admin Panel
- **Login**: Sử dụng tài khoản admin từ seeder
- **URL**: Thông qua frontend hoặc API trực tiếp

---

## 🔄 CHẠY LẠI DỰ ÁN

Nếu cần chạy lại:

```bash
# Backend
cd backend
php artisan serve

# Frontend (terminal mới)
cd frontend
npm run dev
```

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Kiểm tra log files trong `backend/storage/logs/`
2. Kiểm tra console browser (F12)
3. Đảm bảo tất cả services đã start
4. Kiểm tra ports không bị conflict

**Chúc bạn setup thành công! 🎉**