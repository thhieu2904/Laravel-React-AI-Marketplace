@echo off
echo ========================================
echo   HUONG DAN CHAY DU AN DIEN LANH
echo ========================================
echo.

echo [BUOC 1] Tao database trong phpMyAdmin
echo - Mo trinh duyet: http://localhost/phpmyadmin
echo - Tao database: dienlanh_shop
echo - Collation: utf8mb4_unicode_ci
echo.
pause

echo.
echo [BUOC 2] Setup Backend (Laravel)
echo.

cd c:\xampp\htdocs\WEBSITE_DIENLANH\backend

echo - Cai dat dependencies PHP...
call composer install

echo.
echo - Copy file cau hinh...
copy .env.example .env

echo.
echo - Tao application key...
call php artisan key:generate

echo.
echo - Chay migrations...
call php artisan migrate

echo.
echo - Seed du lieu mau...
call php artisan db:seed

echo.
echo [BUOC 3] Setup Frontend (React)
echo.

cd c:\xampp\htdocs\WEBSITE_DIENLANH\frontend

echo - Cai dat dependencies Node.js...
call npm install

echo.
echo ========================================
echo   HOAN THANH SETUP!
echo ========================================
echo.
echo Chay cac lenh sau de khoi dong:
echo.
echo Terminal 1 - Backend:
echo   cd c:\xampp\htdocs\WEBSITE_DIENLANH\backend
echo   php artisan serve
echo.
echo Terminal 2 - Frontend:
echo   cd c:\xampp\htdocs\WEBSITE_DIENLANH\frontend
echo   npm run dev
echo.
echo Truy cap:
echo - Frontend: http://localhost:5173
echo - Backend API: http://localhost:8000
echo.
pause