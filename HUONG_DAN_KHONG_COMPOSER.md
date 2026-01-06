# HƯỚNG DẪN CHẠY DỰ ÁN (KHÔNG CẦN COMPOSER)

## 🎯 CÁCH CHẠY KHÔNG CẦN COMPOSER

### Bước 1: Chuẩn bị
1. **XAMPP đang chạy** (Apache + MySQL)
2. **Tạo database** `dienlanh_shop` trong phpMyAdmin
3. **Node.js đã cài đặt**

### Bước 2: Setup Backend (Laravel)

```cmd
cd c:\xampp\htdocs\WEBSITE_DIENLANH\backend

# 1. Copy file config
copy .env.example .env

# 2. Chỉnh sửa .env (mở bằng notepad)
# Thay đổi:
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dienlanh_shop
DB_USERNAME=root
DB_PASSWORD=

# 3. Tạo app key
php artisan key:generate

# 4. Chạy migrations
php artisan migrate

# 5. Seed data (tùy chọn)
php artisan db:seed
```

### Bước 3: Setup Frontend (React)

```cmd
cd c:\xampp\htdocs\WEBSITE_DIENLANH\frontend

# Cài đặt dependencies
npm install
```

### Bước 4: Chạy servers

**Terminal 1 - Backend:**
```cmd
cd c:\xampp\htdocs\WEBSITE_DIENLANH\backend
php artisan serve
```

**Terminal 2 - Frontend:**
```cmd
cd c:\xampp\htdocs\WEBSITE_DIENLANH\frontend
npm run dev
```

### Bước 5: Truy cập
- **Website**: http://localhost:5173
- **API**: http://localhost:8000/api/health

---

## 🔧 VỀ COMPOSER

Composer là công cụ quản lý package PHP. Nếu không có composer:

### Cách 1: Cài đặt Composer
1. Download: https://getcomposer.org/Composer-Setup.exe
2. Chạy installer
3. Chọn "Add to PATH"
4. Restart terminal

### Cách 2: Sử dụng composer từ XAMPP
1. Mở XAMPP Control Panel
2. Click "Shell" button
3. Terminal sẽ mở với PHP đã config
4. Chạy: `composer install`

### Cách 3: Download vendor files
Nếu không thể cài composer, có thể:
1. Download Laravel project đã có vendor
2. Hoặc copy vendor từ project khác

---

## ⚠️ LƯU Ý

- **Vendor folder** chứa các package PHP cần thiết
- Nếu thiếu vendor, Laravel sẽ không chạy được
- **.env file** phải được config đúng database

**Thử chạy theo hướng dẫn trên xem sao! 🚀**