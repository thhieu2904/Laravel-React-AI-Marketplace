# TÀI KHOẢN TEST VÀ DATABASE SCHEMA

## 1. Tài khoản Test

### 1.1 Admin Accounts

| Username | Email                | Password   | Role          | Trạng thái |
| -------- | -------------------- | ---------- | ------------- | ---------- |
| admin    | admin@dienlanh.com   | `admin123` | Administrator | Active     |
| manager  | manager@dienlanh.com | `admin123` | Manager       | Active     |

**Lưu ý**: Password được hash bằng `bcrypt` với 12 rounds.

### 1.2 Customer Accounts

| Email               | Password      | Họ tên        | SĐT        | Địa chỉ                                |
| ------------------- | ------------- | ------------- | ---------- | -------------------------------------- |
| customer1@gmail.com | `password123` | Nguyễn Văn An | 0901234567 | 123 Nguyễn Huệ, Q.1, TP.HCM            |
| customer2@gmail.com | `password123` | Trần Thị Bình | 0912345678 | 456 Lê Lợi, Q.3, TP.HCM                |
| customer3@gmail.com | `password123` | Lê Văn Cường  | 0923456789 | 789 Hai Bà Trưng, Q.Bình Thạnh, TP.HCM |

---

## 2. Database Schema

### 2.1 Tổng quan

- **Database**: `dienlanh_shop`
- **Engine**: InnoDB
- **Charset**: utf8mb4_unicode_ci
- **Số bảng**: 13

### 2.2 Danh sách Bảng

| #   | Tên bảng             | Mô tả                | Số cột |
| --- | -------------------- | -------------------- | ------ |
| 1   | admins               | Quản trị viên        | 7      |
| 2   | customers            | Khách hàng           | 8      |
| 3   | categories           | Danh mục sản phẩm    | 9      |
| 4   | products             | Sản phẩm             | 14     |
| 5   | product_images       | Ảnh sản phẩm         | 5      |
| 6   | reviews              | Đánh giá sản phẩm    | 6      |
| 7   | carts                | Giỏ hàng             | 4      |
| 8   | cart_items           | Chi tiết giỏ hàng    | 5      |
| 9   | orders               | Đơn hàng             | 15     |
| 10  | order_items          | Chi tiết đơn hàng    | 7      |
| 11  | payment_transactions | Giao dịch thanh toán | 10     |
| 12  | chat_conversations   | Cuộc hội thoại chat  | 5      |
| 13  | chat_messages        | Tin nhắn chat        | 5      |

---

## 3. Chi tiết Các Bảng

### 3.1 admins

```sql
CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3.2 customers

```sql
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
);
```

### 3.3 categories

```sql
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent_id INT NULL,                    -- Self-reference cho danh mục cha
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    image VARCHAR(255) NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);
```

### 3.4 products

```sql
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    short_description VARCHAR(500) NULL,
    description TEXT NULL,
    original_price DECIMAL(12, 0) NOT NULL,  -- Giá gốc (VND)
    sale_price DECIMAL(12, 0) NULL,          -- Giá khuyến mãi
    stock_quantity INT DEFAULT 0,
    brand VARCHAR(100) NULL,
    specifications JSON NULL,                 -- Thông số kỹ thuật
    is_featured BOOLEAN DEFAULT FALSE,        -- Sản phẩm nổi bật
    is_active BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_category (category_id),
    INDEX idx_featured (is_featured)
);
```

### 3.5 product_images

```sql
CREATE TABLE product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,        -- Cloudinary URL
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,        -- Ảnh đại diện
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### 3.6 reviews

```sql
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    product_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NULL,
    is_approved BOOLEAN DEFAULT FALSE,      -- Chờ Admin duyệt
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY uq_customer_product (customer_id, product_id)  -- 1 user = 1 review/product
);
```

### 3.7 carts

```sql
CREATE TABLE carts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL UNIQUE,        -- 1 customer = 1 cart
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);
```

### 3.8 cart_items

```sql
CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_product (cart_id, product_id)
);
```

### 3.9 orders

```sql
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    order_code VARCHAR(20) NOT NULL UNIQUE,  -- VD: ORD20260105001
    subtotal DECIMAL(12, 0) NOT NULL,
    shipping_fee DECIMAL(12, 0) DEFAULT 0,
    total_amount DECIMAL(12, 0) NOT NULL,
    status ENUM('pending', 'confirmed', 'shipping', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_method ENUM('cod', 'bank_transfer', 'online') DEFAULT 'cod',
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    -- Snapshot thông tin giao hàng
    shipping_name VARCHAR(100) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    note TEXT NULL,
    paid_at TIMESTAMP NULL,                  -- Thời điểm thanh toán
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    INDEX idx_customer (customer_id),
    INDEX idx_status (status)
);
```

### 3.10 order_items

```sql
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    -- Snapshot thông tin sản phẩm tại thời điểm đặt hàng
    product_name VARCHAR(255) NOT NULL,
    product_image VARCHAR(255) NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12, 0) NOT NULL,
    total_price DECIMAL(12, 0) NOT NULL,

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);
```

### 3.11 payment_transactions

```sql
CREATE TABLE payment_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    request_id VARCHAR(100) NOT NULL UNIQUE,   -- Mã nội bộ để map webhook
    transaction_id VARCHAR(100) NULL,           -- Mã từ cổng thanh toán
    provider ENUM('mock', 'sepay', 'vnpay', 'momo') NOT NULL DEFAULT 'mock',
    amount DECIMAL(12, 0) NOT NULL,
    status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
    signature_valid BOOLEAN NULL,               -- Kết quả verify webhook
    provider_response JSON NULL,                -- Raw response từ webhook
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    UNIQUE KEY uq_transaction_id (transaction_id)
);
```

### 3.12 chat_conversations

```sql
CREATE TABLE chat_conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NULL,                      -- NULL = khách vãng lai
    session_id VARCHAR(100) NOT NULL,          -- Session identifier
    title VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    INDEX idx_session (session_id)
);
```

### 3.13 chat_messages

```sql
CREATE TABLE chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    sender_type ENUM('customer', 'bot') NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
);
```

---

## 4. Mối quan hệ (Entity Relationships)

```
admins (standalone)

customers ─┬── carts ────── cart_items ────── products
           │
           ├── orders ───── order_items ──────┘
           │      │
           │      └── payment_transactions
           │
           ├── reviews ───────────────────────┘
           │
           └── chat_conversations ── chat_messages

categories ─┬── categories (self-reference: parent/children)
            │
            └── products ── product_images
```

---

## 5. Sample Data Summary

### 5.1 Số lượng dữ liệu mẫu

| Bảng                 | Số records         |
| -------------------- | ------------------ |
| admins               | 2                  |
| customers            | 3                  |
| categories           | 10 (4 cha + 6 con) |
| products             | 12                 |
| product_images       | 12                 |
| carts                | 3                  |
| cart_items           | 3                  |
| orders               | 4                  |
| order_items          | 4                  |
| payment_transactions | 2                  |
| reviews              | 4                  |
| chat_conversations   | 3                  |
| chat_messages        | 6                  |

### 5.2 Danh mục sản phẩm

| ID  | Tên danh mục         | Parent   |
| --- | -------------------- | -------- |
| 1   | Máy lạnh             | -        |
| 2   | Tủ lạnh              | -        |
| 3   | Máy giặt             | -        |
| 4   | Quạt điện            | -        |
| 5   | Máy lạnh treo tường  | Máy lạnh |
| 6   | Máy lạnh âm trần     | Máy lạnh |
| 7   | Máy lạnh tủ đứng     | Máy lạnh |
| 8   | Tủ lạnh mini         | Tủ lạnh  |
| 9   | Tủ lạnh 2 cánh       | Tủ lạnh  |
| 10  | Tủ lạnh Side by Side | Tủ lạnh  |

### 5.3 Sản phẩm mẫu

| ID  | Tên sản phẩm                | Thương hiệu | Giá gốc    | Giá KM     |
| --- | --------------------------- | ----------- | ---------- | ---------- |
| 1   | Máy lạnh Daikin 1HP FTKZ25  | Daikin      | 12,500,000 | 11,500,000 |
| 2   | Máy lạnh Panasonic 1.5HP    | Panasonic   | 15,000,000 | 13,500,000 |
| 3   | Máy lạnh LG 1HP V10ENW1     | LG          | 9,500,000  | 8,500,000  |
| 4   | Máy lạnh âm trần Daikin 2HP | Daikin      | 28,000,000 | 26,000,000 |
| 5   | Tủ lạnh Samsung 300L        | Samsung     | 8,500,000  | 7,900,000  |
| 6   | Tủ lạnh LG 335L             | LG          | 9,200,000  | 8,500,000  |
| 7   | Tủ lạnh Samsung SBS 680L    | Samsung     | 28,000,000 | 25,500,000 |
| 8   | Tủ lạnh mini Aqua 90L       | Aqua        | 2,800,000  | 2,500,000  |
| 9   | Máy giặt LG 9kg             | LG          | 8,500,000  | 7,800,000  |
| 10  | Máy giặt Samsung 10kg       | Samsung     | 9,800,000  | 9,000,000  |
| 11  | Quạt trần Panasonic         | Panasonic   | 2,200,000  | 1,950,000  |
| 12  | Quạt đứng Senko             | Senko       | 850,000    | 750,000    |

---

## 6. Hướng dẫn Import Database

### 6.1 Tạo Schema

```bash
mysql -u root -p < docs/schema.sql
```

### 6.2 Import Seed Data

```bash
mysql -u root dienlanh_shop < docs/seed.sql
```

### 6.3 Hoặc dùng Laravel Migration (nếu đã setup)

```bash
cd backend
php artisan migrate:fresh --seed
```
