-- ============================================
-- DATABASE SCHEMA: Website Bán Điện Lạnh
-- Version: 3.0 (Final - Student Project)
-- Created: 2026-01-02
-- Tables: 12
-- ============================================

DROP DATABASE IF EXISTS dienlanh_shop;
CREATE DATABASE dienlanh_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dienlanh_shop;

-- ============================================
-- 1. ADMINS - Quản trị viên
-- ============================================
CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- 2. CUSTOMERS - Khách hàng
-- ============================================
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NULL,
    address TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- 3. CATEGORIES - Danh mục sản phẩm
-- ============================================
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent_id INT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    image VARCHAR(255) NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- 4. PRODUCTS - Sản phẩm
-- ============================================
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    short_description VARCHAR(500) NULL,
    description TEXT NULL,
    original_price DECIMAL(12, 0) NOT NULL,
    sale_price DECIMAL(12, 0) NULL,
    stock_quantity INT DEFAULT 0,
    brand VARCHAR(100) NULL,
    specifications JSON NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_category (category_id),
    INDEX idx_featured (is_featured)
) ENGINE=InnoDB;

-- ============================================
-- 5. PRODUCT_IMAGES - Ảnh sản phẩm
-- ============================================
CREATE TABLE product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- 6. REVIEWS - Đánh giá sản phẩm
-- ============================================
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    product_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    -- Chặn spam: 1 customer chỉ review 1 sản phẩm 1 lần
    UNIQUE KEY uq_customer_product (customer_id, product_id)
) ENGINE=InnoDB;

-- ============================================
-- 7. CARTS - Giỏ hàng
-- ============================================
CREATE TABLE carts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- 8. CART_ITEMS - Chi tiết giỏ hàng
-- ============================================
CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_product (cart_id, product_id)
) ENGINE=InnoDB;

-- ============================================
-- 9. ORDERS - Đơn hàng
-- ============================================
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    order_code VARCHAR(20) NOT NULL UNIQUE,
    subtotal DECIMAL(12, 0) NOT NULL,
    shipping_fee DECIMAL(12, 0) DEFAULT 0,
    total_amount DECIMAL(12, 0) NOT NULL,
    status ENUM('pending', 'confirmed', 'shipping', 'delivered', 'cancelled') DEFAULT 'pending',
    -- 'online' = cổng thanh toán (cụ thể cổng nào xem ở payment_transactions.provider)
    payment_method ENUM('cod', 'bank_transfer', 'online') DEFAULT 'cod',
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    -- Thông tin giao hàng (snapshot)
    shipping_name VARCHAR(100) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    note TEXT NULL,
    paid_at TIMESTAMP NULL COMMENT 'Thời điểm thanh toán thành công',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    INDEX idx_customer (customer_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================
-- 10. ORDER_ITEMS - Chi tiết đơn hàng
-- ============================================
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_image VARCHAR(255) NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12, 0) NOT NULL,
    total_price DECIMAL(12, 0) NOT NULL,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order (order_id)
) ENGINE=InnoDB;

-- ============================================
-- 11. PAYMENT_TRANSACTIONS - Log thanh toán
-- ============================================
-- Giải thích các field quan trọng:
-- - request_id: Mã do HỆ THỐNG MÌNH sinh, dùng để map webhook về đúng đơn
-- - transaction_id: Mã do CỔNG THANH TOÁN trả về (có thể null ban đầu)
-- - provider: Cổng thanh toán nào (mock/sepay/vnpay/momo)
-- - signature_valid: Đã verify chữ ký từ webhook chưa (bảo mật)
-- ============================================
CREATE TABLE payment_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    -- Mã request do mình tự sinh (gửi đi khi tạo payment)
    request_id VARCHAR(100) NOT NULL UNIQUE COMMENT 'Mã mình tự sinh để map webhook',
    -- Mã transaction từ cổng thanh toán trả về
    transaction_id VARCHAR(100) NULL COMMENT 'Mã từ SePay/VNPay/MoMo',
    -- Cổng thanh toán
    provider ENUM('mock', 'sepay', 'vnpay', 'momo') NOT NULL DEFAULT 'mock',
    amount DECIMAL(12, 0) NOT NULL,
    status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
    -- Bảo mật: đã verify signature từ webhook chưa
    signature_valid BOOLEAN NULL COMMENT 'NULL=chưa verify, TRUE/FALSE=kết quả verify',
    -- Lưu raw response để debug
    provider_response JSON NULL COMMENT 'Response gốc từ webhook',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    -- request_id đã UNIQUE ở trên, không cần khai báo lại
    UNIQUE KEY uq_transaction_id (transaction_id)
) ENGINE=InnoDB;

-- ============================================
-- 12. CHAT_CONVERSATIONS - Cuộc hội thoại chatbot
-- ============================================
CREATE TABLE chat_conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NULL,
    session_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    INDEX idx_session (session_id)
) ENGINE=InnoDB;

-- ============================================
-- 13. CHAT_MESSAGES - Tin nhắn chatbot
-- ============================================
CREATE TABLE chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    sender_type ENUM('customer', 'bot') NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TỔNG KẾT: 13 BẢNG
-- ============================================
-- Auth:     admins, customers (2)
-- Products: categories, products, product_images (3)
-- Reviews:  reviews (1)
-- Cart:     carts, cart_items (2)
-- Orders:   orders, order_items (2)
-- Payment:  payment_transactions (1)
-- Chatbot:  chat_conversations, chat_messages (2)
-- ============================================
