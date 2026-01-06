# API VÀ CHỨC NĂNG BACKEND

## 1. Tổng quan API

- **Base URL**: `http://localhost:8000/api`
- **Format**: JSON
- **Authentication**: JWT Bearer Token
- **Tổng số routes**: 50+ endpoints

---

## 2. Public API (Không cần xác thực)

### 2.1 Health Check

```
GET /health
Response: { status: "ok", message: "API is running", timestamp: "..." }
```

### 2.2 Category API

| Method | Endpoint                    | Mô tả                  |
| ------ | --------------------------- | ---------------------- |
| GET    | `/public/categories`        | Lấy danh sách danh mục |
| GET    | `/public/categories/{slug}` | Lấy chi tiết danh mục  |

### 2.3 Product API

| Method | Endpoint                        | Mô tả                  |
| ------ | ------------------------------- | ---------------------- |
| GET    | `/public/products`              | Lấy danh sách sản phẩm |
| GET    | `/public/products/featured`     | Lấy sản phẩm nổi bật   |
| GET    | `/public/products/{slug}`       | Lấy chi tiết sản phẩm  |
| GET    | `/public/products/{id}/related` | Lấy sản phẩm liên quan |

**Query Parameters cho `/public/products`**:

```
?category_id=1          // Lọc theo danh mục
?search=daikin          // Tìm kiếm theo tên
?min_price=5000000      // Giá tối thiểu
?max_price=20000000     // Giá tối đa
?brand=Daikin           // Lọc theo thương hiệu
?sort=price_asc         // Sắp xếp: price_asc, price_desc, newest, popular
?per_page=12            // Số sản phẩm/trang
?page=1                 // Trang hiện tại
```

### 2.4 Review API (Public)

| Method | Endpoint                       | Mô tả                     |
| ------ | ------------------------------ | ------------------------- |
| GET    | `/reviews/product/{productId}` | Lấy đánh giá của sản phẩm |

---

## 3. Customer Auth API

### 3.1 Authentication

| Method | Endpoint                    | Mô tả               | Auth |
| ------ | --------------------------- | ------------------- | ---- |
| POST   | `/customer/register`        | Đăng ký tài khoản   | ❌   |
| POST   | `/customer/login`           | Đăng nhập           | ❌   |
| GET    | `/customer/me`              | Lấy thông tin user  | ✅   |
| PUT    | `/customer/profile`         | Cập nhật profile    | ✅   |
| POST   | `/customer/change-password` | Đổi mật khẩu        | ✅   |
| POST   | `/customer/account-request` | Yêu cầu xóa/khóa TK | ✅   |
| POST   | `/customer/logout`          | Đăng xuất           | ✅   |
| POST   | `/customer/refresh`         | Refresh token       | ✅   |

**Register Request**:

```json
{
  "email": "customer@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "full_name": "Nguyễn Văn A",
  "phone": "0901234567",
  "address": "123 Đường ABC, Quận 1, TP.HCM"
}
```

**Login Response**:

```json
{
  "success": true,
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "email": "customer@example.com",
      "full_name": "Nguyễn Văn A"
    }
  }
}
```

---

## 4. Cart API (Customer Protected)

| Method | Endpoint         | Mô tả                 |
| ------ | ---------------- | --------------------- |
| GET    | `/cart`          | Lấy giỏ hàng          |
| POST   | `/cart`          | Thêm sản phẩm vào giỏ |
| PUT    | `/cart/{itemId}` | Cập nhật số lượng     |
| DELETE | `/cart/{itemId}` | Xóa sản phẩm khỏi giỏ |
| DELETE | `/cart`          | Xóa toàn bộ giỏ hàng  |

**Add to Cart Request**:

```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Cart Response**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "quantity": 2,
        "product": {
          "id": 1,
          "name": "Máy lạnh Daikin 1HP",
          "original_price": 12500000,
          "sale_price": 11500000,
          "stock_quantity": 15,
          "primary_image": "https://..."
        }
      }
    ],
    "total_items": 2,
    "total_price": 23000000
  }
}
```

---

## 5. Order API (Customer Protected)

| Method | Endpoint                     | Mô tả                  |
| ------ | ---------------------------- | ---------------------- |
| GET    | `/orders`                    | Lấy danh sách đơn hàng |
| POST   | `/orders`                    | Tạo đơn hàng mới       |
| GET    | `/orders/{orderCode}`        | Chi tiết đơn hàng      |
| POST   | `/orders/{orderCode}/cancel` | Hủy đơn hàng           |

**Create Order Request**:

```json
{
  "shipping_name": "Nguyễn Văn A",
  "shipping_phone": "0901234567",
  "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
  "payment_method": "online",
  "note": "Giao giờ hành chính"
}
```

**Order Status Flow**:

```
pending → confirmed → shipping → delivered
    ↓         ↓
    └─────────────────→ cancelled
```

---

## 6. Review API (Customer Protected)

| Method | Endpoint        | Mô tả                |
| ------ | --------------- | -------------------- |
| GET    | `/reviews/my`   | Lấy đánh giá của tôi |
| POST   | `/reviews`      | Viết đánh giá mới    |
| PUT    | `/reviews/{id}` | Sửa đánh giá         |
| DELETE | `/reviews/{id}` | Xóa đánh giá         |

**Create Review Request**:

```json
{
  "product_id": 1,
  "rating": 5,
  "comment": "Sản phẩm rất tốt, giao hàng nhanh!"
}
```

---

## 7. Payment API

| Method | Endpoint                      | Mô tả                      | Auth        |
| ------ | ----------------------------- | -------------------------- | ----------- |
| POST   | `/payment/create`             | Tạo giao dịch thanh toán   | Customer ✅ |
| GET    | `/payment/mock-checkout`      | Trang thanh toán giả lập   | ❌          |
| GET    | `/payment/status/{requestId}` | Kiểm tra trạng thái        | ❌          |
| POST   | `/payment/webhook/{provider}` | Webhook từ cổng thanh toán | ❌          |

**Payment Providers**:

- `mock`: Giả lập (cho development)
- `sepay`: SePay VietQR (production)
- `vnpay`: VNPay (future)
- `momo`: MoMo (future)

**Create Payment Response (SePay)**:

```json
{
  "success": true,
  "data": {
    "provider": "sepay",
    "request_id": "REQ_ORD20260105001_1735880000",
    "qr_code_url": "https://img.vietqr.io/image/TPB-10003096558-compact2.png?amount=11500000&addInfo=REQ_ORD...",
    "bank_info": {
      "bank_name": "TPBank",
      "account_number": "10003096558",
      "account_name": "NGUYEN THANH HIEU",
      "amount": 11500000,
      "transfer_content": "REQ_ORD20260105001_1735880000"
    }
  }
}
```

---

## 8. Chat API (AI Chatbot)

| Method | Endpoint             | Mô tả                 | Auth |
| ------ | -------------------- | --------------------- | ---- |
| GET    | `/chat/conversation` | Lấy/tạo conversation  | ❌   |
| POST   | `/chat/message`      | Gửi tin nhắn          | ❌   |
| GET    | `/chat/stream`       | Stream response (SSE) | ❌   |
| GET    | `/chat/history`      | Lấy lịch sử chat      | ❌   |

**Send Message Request**:

```json
{
  "session_id": "sess_abc123",
  "message": "Cho mình hỏi máy lạnh Daikin 1HP giá bao nhiêu?"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "conversation_id": 1,
    "message": {
      "id": 2,
      "sender_type": "bot",
      "content": "Dạ, máy lạnh Daikin Inverter 1HP hiện đang có giá khuyến mãi 11.500.000đ...",
      "created_at": "2026-01-05T10:30:00Z"
    }
  }
}
```

---

## 9. Admin API

### 9.1 Admin Authentication

| Method | Endpoint         | Mô tả               | Auth     |
| ------ | ---------------- | ------------------- | -------- |
| POST   | `/admin/login`   | Đăng nhập admin     | ❌       |
| GET    | `/admin/me`      | Lấy thông tin admin | Admin ✅ |
| POST   | `/admin/logout`  | Đăng xuất           | Admin ✅ |
| POST   | `/admin/refresh` | Refresh token       | Admin ✅ |

### 9.2 Admin Categories

| Method | Endpoint                 | Mô tả              |
| ------ | ------------------------ | ------------------ |
| GET    | `/admin/categories`      | Danh sách danh mục |
| GET    | `/admin/categories/{id}` | Chi tiết danh mục  |
| POST   | `/admin/categories`      | Tạo danh mục       |
| PUT    | `/admin/categories/{id}` | Cập nhật danh mục  |
| DELETE | `/admin/categories/{id}` | Xóa danh mục       |

### 9.3 Admin Products

| Method | Endpoint                               | Mô tả              |
| ------ | -------------------------------------- | ------------------ |
| GET    | `/admin/products`                      | Danh sách sản phẩm |
| GET    | `/admin/products/{id}`                 | Chi tiết sản phẩm  |
| POST   | `/admin/products`                      | Tạo sản phẩm       |
| PUT    | `/admin/products/{id}`                 | Cập nhật sản phẩm  |
| DELETE | `/admin/products/{id}`                 | Xóa sản phẩm       |
| PATCH  | `/admin/products/{id}/toggle-status`   | Bật/tắt trạng thái |
| PATCH  | `/admin/products/{id}/toggle-featured` | Bật/tắt nổi bật    |

### 9.4 Admin Orders

| Method | Endpoint                    | Mô tả               |
| ------ | --------------------------- | ------------------- |
| GET    | `/admin/orders`             | Danh sách đơn hàng  |
| GET    | `/admin/orders/stats`       | Thống kê đơn hàng   |
| GET    | `/admin/orders/{id}`        | Chi tiết đơn hàng   |
| PATCH  | `/admin/orders/{id}/status` | Cập nhật trạng thái |

### 9.5 Admin Customers

| Method | Endpoint                              | Mô tả                |
| ------ | ------------------------------------- | -------------------- |
| GET    | `/admin/customers`                    | Danh sách khách hàng |
| GET    | `/admin/customers/stats`              | Thống kê khách hàng  |
| GET    | `/admin/customers/{id}`               | Chi tiết khách hàng  |
| PATCH  | `/admin/customers/{id}/toggle-status` | Khóa/mở khóa TK      |

### 9.6 Admin Reviews

| Method | Endpoint                       | Mô tả                 |
| ------ | ------------------------------ | --------------------- |
| GET    | `/admin/reviews`               | Danh sách đánh giá    |
| GET    | `/admin/reviews/pending-count` | Số đánh giá chờ duyệt |
| PATCH  | `/admin/reviews/{id}/approve`  | Duyệt đánh giá        |
| PATCH  | `/admin/reviews/{id}/reject`   | Từ chối đánh giá      |
| DELETE | `/admin/reviews/{id}`          | Xóa đánh giá          |

### 9.7 Admin Stats (Dashboard)

| Method | Endpoint                        | Mô tả                                  |
| ------ | ------------------------------- | -------------------------------------- |
| GET    | `/admin/stats/overview`         | Tổng quan (revenue, orders, customers) |
| GET    | `/admin/stats/revenue-chart`    | Biểu đồ doanh thu                      |
| GET    | `/admin/stats/top-products`     | Sản phẩm bán chạy                      |
| GET    | `/admin/stats/recent-orders`    | Đơn hàng gần đây                       |
| GET    | `/admin/stats/orders-by-status` | Đơn hàng theo trạng thái               |

---

## 10. Error Responses

### Standard Error Format

```json
{
  "success": false,
  "message": "Mô tả lỗi",
  "errors": {
    "field_name": ["Chi tiết lỗi validation"]
  }
}
```

### HTTP Status Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | OK                                   |
| 201  | Created                              |
| 400  | Bad Request                          |
| 401  | Unauthorized (Token invalid/expired) |
| 403  | Forbidden                            |
| 404  | Not Found                            |
| 422  | Validation Error                     |
| 500  | Server Error                         |

---

## 11. Pagination Response

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 12,
    "total": 60
  }
}
```
