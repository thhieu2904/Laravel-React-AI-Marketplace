# HƯỚNG DẪN NHANH CHẠY DỰ ÁN

## ⚡ CÁCH NHANH NHẤT

### Bước 1: Double-click file `setup.bat`
- File này sẽ tự động cài đặt mọi thứ
- Thực hiện từng bước setup backend và frontend

### Bước 2: Sau khi setup xong
Mở **2 terminal/command prompt** riêng biệt:

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

### Bước 3: Truy cập
- **Website**: http://localhost:5173
- **API**: http://localhost:8000/api/health

---

## 🔧 NẾU SETUP.BAT KHÔNG HOẠT ĐỘNG

### Thực hiện thủ công:

1. **Tạo database:**
   - Mở: http://localhost/phpmyadmin
   - Tạo DB: `dienlanh_shop`

2. **Backend setup:**
   ```cmd
   cd backend
   composer install
   copy .env.example .env
   php artisan key:generate
   php artisan migrate
   php artisan db:seed
   ```

3. **Frontend setup:**
   ```cmd
   cd frontend
   npm install
   ```

4. **Chạy servers:**
   ```cmd
   # Terminal 1
   cd backend && php artisan serve

   # Terminal 2
   cd frontend && npm run dev
   ```

---

## ❗ LƯU Ý QUAN TRỌNG

- **XAMPP phải đang chạy** (Apache + MySQL)
- **Composer phải được cài đặt** và có trong PATH
- **Node.js phải được cài đặt**
- Nếu gặp lỗi, kiểm tra file log trong `backend/storage/logs/`

---

## 🎯 KIỂM TRA HOẠT ĐỘNG

Sau khi chạy xong:
1. Mở http://localhost:5173 → Thấy trang chủ website
2. Mở http://localhost:8000/api/health → Thấy JSON response
3. Mở http://localhost/phpmyadmin → Thấy database `dienlanh_shop` có dữ liệu