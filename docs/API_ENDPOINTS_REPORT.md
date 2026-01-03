# API Endpoints Report - Website Bán Điện Lạnh

**Generated Date:** 2026-01-04
**Base URL:** `http://localhost:8000/api`
**Format:** JSON

## 1. Authentication & Authorization

Hệ thống sử dụng **JWT (JSON Web Token)** để xác thực.

- **Header:** `Authorization: Bearer <token>`
- **Guards:**
  - `auth:customer`: Dành cho khách hàng mua sắm.
  - `auth:admin`: Dành cho quản trị viên.

---

## 2. Public Routes (Không yêu cầu đăng nhập)

Các API này phục vụ cho việc hiển thị sản phẩm, danh mục và các tiện ích công cộng.

| Method | Endpoint                        | Chức năng                                    | Controller                               |
| :----- | :------------------------------ | :------------------------------------------- | :--------------------------------------- |
| `GET`  | `/health`                       | Kiểm tra trạng thái hệ thống                 | Closure                                  |
| `GET`  | `/public/categories`            | Lấy danh sách danh mục (cây phân cấp)        | `Public\CategoryController@index`        |
| `GET`  | `/public/categories/{slug}`     | Chi tiết danh mục & sản phẩm thuộc danh mục  | `Public\CategoryController@show`         |
| `GET`  | `/public/products`              | Danh sách sản phẩm (Search, Filter, Sort)    | `Public\ProductController@index`         |
| `GET`  | `/public/products/featured`     | Top sản phẩm nổi bật (cho HomePage)          | `Public\ProductController@featured`      |
| `GET`  | `/public/products/{slug}`       | Chi tiết sản phẩm                            | `Public\ProductController@show`          |
| `GET`  | `/public/products/{id}/related` | Sản phẩm liên quan                           | `Public\ProductController@related`       |
| `GET`  | `/reviews/product/{productId}`  | Xem đánh giá của sản phẩm                    | `Public\ReviewController@productReviews` |
| `GET`  | `/payment/mock-checkout`        | Trang thanh toán giả lập (cho dev/test)      | `PaymentController@mockCheckout`         |
| `POST` | `/payment/webhook/{provider}`   | Webhook nhận kết quả thanh toán (SePay/Mock) | `PaymentController@webhook`              |
| `GET`  | `/chat/stream`                  | Chatbot SSE stream (Real-time)               | `ChatController@streamMessage`           |
| `POST` | `/chat/message`                 | Gửi tin nhắn cho Chatbot                     | `ChatController@sendMessage`             |
| `GET`  | `/chat/conversation`            | Lấy/Tạo phiên chat (Session based)           | `ChatController@getConversation`         |

---

## 3. Customer Routes (Khách hàng)

### Authentication

**Prefix:** `/customer`

| Method | Endpoint    | Chức năng                 | Auth?   |
| :----- | :---------- | :------------------------ | :------ |
| `POST` | `/register` | Đăng ký tài khoản mới     | No      |
| `POST` | `/login`    | Đăng nhập (trả về JWT)    | No      |
| `GET`  | `/me`       | Lấy thông tin profile     | **Yes** |
| `POST` | `/logout`   | Đăng xuất (yêu cầu token) | **Yes** |
| `POST` | `/refresh`  | Làm mới token             | **Yes** |

### Shopping Cart (Giỏ hàng)

**Prefix:** `/cart`
**Middleware:** `auth:customer`

| Method   | Endpoint    | Chức năng             | Mô tả                         |
| :------- | :---------- | :-------------------- | :---------------------------- |
| `GET`    | `/`         | Xem giỏ hàng          | Lấy danh sách item, tổng tiền |
| `POST`   | `/`         | Thêm vào giỏ          | `{product_id, quantity}`      |
| `PUT`    | `/{itemId}` | Cập nhật số lượng     | `{quantity}`                  |
| `DELETE` | `/{itemId}` | Xóa sản phẩm khỏi giỏ |                               |
| `DELETE` | `/`         | Xóa toàn bộ giỏ       |                               |

### Orders (Đơn hàng)

**Prefix:** `/orders`
**Middleware:** `auth:customer`

| Method | Endpoint              | Chức năng           | Mô tả                                      |
| :----- | :-------------------- | :------------------ | :----------------------------------------- |
| `GET`  | `/`                   | Lịch sử đơn hàng    | Danh sách đơn hàng đã đặt                  |
| `POST` | `/`                   | Đặt hàng (Checkout) | Tạo đơn từ giỏ hàng hiện tại               |
| `GET`  | `/{orderCode}`        | Chi tiết đơn hàng   | Xem items, trạng thái, thanh toán          |
| `POST` | `/{orderCode}/cancel` | Hủy đơn hàng        | Chỉ hủy được khi còn `pending`/`confirmed` |

### Payment (Thanh toán)

**Prefix:** `/payment`
**Middleware:** `auth:customer` (trừ webhook/status public)

| Method | Endpoint              | Chức năng                                 |
| :----- | :-------------------- | :---------------------------------------- |
| `POST` | `/create`             | Tạo giao dịch thanh toán online (lấy URL) |
| `GET`  | `/status/{requestId}` | Kiểm tra trạng thái giao dịch             |

### Reviews (Đánh giá)

**Prefix:** `/reviews`
**Middleware:** `auth:customer`

| Method   | Endpoint | Chức năng        | Quy tắc                         |
| :------- | :------- | :--------------- | :------------------------------ |
| `GET`    | `/my`    | Đánh giá của tôi |                                 |
| `POST`   | `/`      | Viết đánh giá    | Phải mua hàng mới được đánh giá |
| `PUT`    | `/{id}`  | Sửa đánh giá     |                                 |
| `DELETE` | `/{id}`  | Xóa đánh giá     |                                 |

### Chat History

**Prefix:** `/chat`
| Method | Endpoint | Chức năng | Auth? |
| :--- | :--- | :--- | :--- |
| `GET` | `/history` | Lịch sử các cuộc hội thoại cũ | **Yes** |

---

## 4. Admin Routes (Quản trị viên)

**Prefix:** `/admin`

### Authentication

| Method | Endpoint  | Chức năng       | Auth?   |
| :----- | :-------- | :-------------- | :------ |
| `POST` | `/login`  | Đăng nhập Admin | No      |
| `GET`  | `/me`     | Thông tin Admin | **Yes** |
| `POST` | `/logout` | Đăng xuất       | **Yes** |

### Product Management

**Middleware:** `auth:admin`

| Method   | Endpoint                       | Chức năng                       |
| :------- | :----------------------------- | :------------------------------ |
| `GET`    | `/categories`                  | Danh sách danh mục (Admin view) |
| `POST`   | `/categories`                  | Tạo danh mục                    |
| `PUT`    | `/categories/{id}`             | Sửa danh mục                    |
| `DELETE` | `/categories/{id}`             | Xóa danh mục                    |
| `GET`    | `/products`                    | Danh sách sản phẩm              |
| `POST`   | `/products`                    | Tạo sản phẩm mới (kèm ảnh)      |
| `PUT`    | `/products/{id}`               | Cập nhật sản phẩm               |
| `PATCH`  | `/products/{id}/toggle-status` | Bật/Tắt sản phẩm                |
| `DELETE` | `/products/{id}`               | Xóa sản phẩm                    |

### Order Management

**Middleware:** `auth:admin`

| Method  | Endpoint              | Chức năng                                             |
| :------ | :-------------------- | :---------------------------------------------------- |
| `GET`   | `/orders`             | Danh sách đơn hàng (Filter status, date)              |
| `GET`   | `/orders/stats`       | Thống kê nhanh đơn hàng                               |
| `GET`   | `/orders/{id}`        | Chi tiết đơn hàng                                     |
| `PATCH` | `/orders/{id}/status` | Cập nhật trạng thái (`pending` -> `confirmed` -> ...) |

### Review Management

**Middleware:** `auth:admin`

| Method   | Endpoint                 | Chức năng                               |
| :------- | :----------------------- | :-------------------------------------- |
| `GET`    | `/reviews`               | Danh sách đánh giá (chờ duyệt/đã duyệt) |
| `GET`    | `/reviews/pending-count` | Số lượng đánh giá chờ duyệt             |
| `PATCH`  | `/reviews/{id}/approve`  | Duyệt đánh giá                          |
| `PATCH`  | `/reviews/{id}/reject`   | Từ chối/Ẩn đánh giá                     |
| `DELETE` | `/reviews/{id}`          | Xóa đánh giá                            |

### Statistics & Dashboard

**Middleware:** `auth:admin`

| Method | Endpoint                  | Chức năng           | Return Data                             |
| :----- | :------------------------ | :------------------ | :-------------------------------------- |
| `GET`  | `/stats/overview`         | Tổng quan Dashboard | Orders, Revenue, Users, Products counts |
| `GET`  | `/stats/revenue-chart`    | Biểu đồ doanh thu   | Doanh thu theo ngày (30 ngày)           |
| `GET`  | `/stats/top-products`     | Top bán chạy        | Sản phẩm + số lượng đã bán              |
| `GET`  | `/stats/recent-orders`    | Đơn hàng mới nhất   | 10 đơn hàng gần đây                     |
| `GET`  | `/stats/orders-by-status` | Tỷ lệ đơn hàng      | Pie chart data theo trạng thái          |

---

## 5. Danh sách các Model (Database)

1.  `User` (Laravel Default - unused/base)
2.  `Admin` (Quản trị viên)
3.  `Customer` (Khách hàng)
4.  `Category` (Danh mục)
5.  `Product` (Sản phẩm)
6.  `ProductImage` (Ảnh sản phẩm)
7.  `Cart` (Giỏ hàng)
8.  `CartItem` (Chi tiết giỏ)
9.  `Order` (Đơn hàng)
10. `OrderItem` (Chi tiết đơn)
11. `PaymentTransaction` (Giao dịch thanh toán)
12. `Review` (Đánh giá)
13. `ChatConversation` (Hội thoại Chatbot)
14. `ChatMessage` (Tin nhắn)
