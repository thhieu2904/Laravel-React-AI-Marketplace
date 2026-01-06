# CẤU TRÚC BACKEND VÀ CÁCH TỔ CHỨC

## 1. Kiến trúc Backend

Backend sử dụng **Laravel 12** theo mô hình **MVC (Model-View-Controller)** với các lớp được tổ chức rõ ràng:

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/           # Controller Layer
│   │   │   ├── Admin/             # 6 Admin Controllers
│   │   │   │   ├── CategoryController.php
│   │   │   │   ├── CustomerController.php
│   │   │   │   ├── OrderController.php
│   │   │   │   ├── ProductController.php
│   │   │   │   ├── ReviewController.php
│   │   │   │   └── StatsController.php
│   │   │   │
│   │   │   ├── Auth/              # 2 Auth Controllers
│   │   │   │   ├── AdminAuthController.php
│   │   │   │   └── CustomerAuthController.php
│   │   │   │
│   │   │   ├── Customer/          # 3 Customer Controllers
│   │   │   │   ├── CartController.php
│   │   │   │   ├── OrderController.php
│   │   │   │   └── ReviewController.php
│   │   │   │
│   │   │   ├── Public/            # 3 Public Controllers
│   │   │   │   ├── CategoryController.php
│   │   │   │   ├── ProductController.php
│   │   │   │   └── ReviewController.php
│   │   │   │
│   │   │   ├── ChatController.php     # AI Chatbot
│   │   │   ├── PaymentController.php  # Payment Gateway
│   │   │   └── Controller.php         # Base Controller
│   │   │
│   │   └── Middleware/
│   │       └── Authenticate.php
│   │
│   ├── Models/                    # Model Layer (13 Models)
│   │   ├── Admin.php
│   │   ├── Customer.php
│   │   ├── Category.php
│   │   ├── Product.php
│   │   ├── ProductImage.php
│   │   ├── Cart.php
│   │   ├── CartItem.php
│   │   ├── Order.php
│   │   ├── OrderItem.php
│   │   ├── Review.php
│   │   ├── PaymentTransaction.php
│   │   ├── ChatConversation.php
│   │   └── ChatMessage.php
│   │
│   ├── Services/                  # Service Layer
│   │   ├── PaymentService.php     # Xử lý thanh toán
│   │   └── GeminiService.php      # AI Chatbot
│   │
│   └── Providers/
│       └── AppServiceProvider.php
│
├── config/                        # Configuration
│   ├── auth.php                   # JWT Guards config
│   └── services.php               # External services config
│
├── database/
│   ├── migrations/                # Database migrations
│   └── seeders/
│
├── routes/
│   └── api.php                    # API Routes (188 lines)
│
└── .env                           # Environment config
```

---

## 2. Controllers Chi tiết

### 2.1 Admin Controllers (6 files)

| Controller         | File                         | Chức năng          |
| ------------------ | ---------------------------- | ------------------ |
| CategoryController | Admin/CategoryController.php | CRUD danh mục      |
| ProductController  | Admin/ProductController.php  | CRUD sản phẩm      |
| OrderController    | Admin/OrderController.php    | Quản lý đơn hàng   |
| CustomerController | Admin/CustomerController.php | Quản lý khách hàng |
| ReviewController   | Admin/ReviewController.php   | Duyệt đánh giá     |
| StatsController    | Admin/StatsController.php    | Thống kê dashboard |

### 2.2 Auth Controllers (2 files)

| Controller             | File                            | Chức năng               |
| ---------------------- | ------------------------------- | ----------------------- |
| AdminAuthController    | Auth/AdminAuthController.php    | Xác thực Admin (JWT)    |
| CustomerAuthController | Auth/CustomerAuthController.php | Xác thực Customer (JWT) |

### 2.3 Customer Controllers (3 files)

| Controller       | File                          | Chức năng              |
| ---------------- | ----------------------------- | ---------------------- |
| CartController   | Customer/CartController.php   | Quản lý giỏ hàng       |
| OrderController  | Customer/OrderController.php  | Đặt hàng, theo dõi đơn |
| ReviewController | Customer/ReviewController.php | Viết/sửa đánh giá      |

### 2.4 Public Controllers (3 files)

| Controller         | File                          | Chức năng             |
| ------------------ | ----------------------------- | --------------------- |
| CategoryController | Public/CategoryController.php | Lấy danh mục (public) |
| ProductController  | Public/ProductController.php  | Lấy sản phẩm (public) |
| ReviewController   | Public/ReviewController.php   | Lấy đánh giá sản phẩm |

### 2.5 Common Controllers (2 files)

| Controller        | File                  | Chức năng                 |
| ----------------- | --------------------- | ------------------------- |
| PaymentController | PaymentController.php | Tích hợp thanh toán SePay |
| ChatController    | ChatController.php    | AI Chatbot (Gemini)       |

---

## 3. Models Chi tiết (13 Models)

### 3.1 User Models

#### Admin Model

```php
class Admin extends Authenticatable implements JWTSubject
{
    protected $fillable = [
        'username', 'email', 'password', 'full_name', 'is_active'
    ];

    // JWT Methods
    public function getJWTIdentifier() { ... }
    public function getJWTCustomClaims() { ... }
}
```

#### Customer Model

```php
class Customer extends Authenticatable implements JWTSubject
{
    protected $fillable = [
        'email', 'password', 'full_name', 'phone', 'address', 'is_active'
    ];

    // Relationships
    public function cart(): HasOne { ... }
    public function orders(): HasMany { ... }
    public function reviews(): HasMany { ... }
}
```

### 3.2 Product Models

#### Category Model

```php
class Category extends Model
{
    protected $fillable = [
        'parent_id', 'name', 'slug', 'description', 'image', 'sort_order', 'is_active'
    ];

    // Self-referencing for subcategories
    public function parent(): BelongsTo { ... }
    public function children(): HasMany { ... }
    public function allChildren(): HasMany { ... }
    public function products(): HasMany { ... }

    // Scopes
    public function scopeActive($query) { ... }
    public function scopeRoot($query) { ... }
}
```

#### Product Model

```php
class Product extends Model
{
    protected $fillable = [
        'category_id', 'name', 'slug', 'short_description', 'description',
        'original_price', 'sale_price', 'stock_quantity', 'brand',
        'specifications', 'is_featured', 'is_active', 'view_count'
    ];

    // Relationships
    public function category(): BelongsTo { ... }
    public function images(): HasMany { ... }
    public function reviews(): HasMany { ... }

    // Scopes
    public function scopeActive($query) { ... }
    public function scopeFeatured($query) { ... }
    public function scopeInStock($query) { ... }

    // Accessors
    public function getCurrentPriceAttribute(): float { ... }
    public function getDiscountPercentAttribute(): ?int { ... }
    public function getAverageRatingAttribute(): ?float { ... }
}
```

### 3.3 Order Models

#### Order Model

```php
class Order extends Model
{
    protected $fillable = [
        'customer_id', 'order_code', 'subtotal', 'shipping_fee', 'total_amount',
        'status', 'payment_method', 'payment_status',
        'shipping_name', 'shipping_phone', 'shipping_address', 'note', 'paid_at'
    ];

    // Enum values
    // status: pending, confirmed, shipping, delivered, cancelled
    // payment_method: cod, bank_transfer, online
    // payment_status: pending, paid, failed

    // Relationships
    public function customer(): BelongsTo { ... }
    public function items(): HasMany { ... }
    public function paymentTransaction(): HasOne { ... }

    // Helper methods
    public static function generateOrderCode(): string { ... }
    public function canBeCancelled(): bool { ... }
}
```

### 3.4 Payment Models

#### PaymentTransaction Model

```php
class PaymentTransaction extends Model
{
    protected $fillable = [
        'order_id', 'request_id', 'transaction_id', 'provider',
        'amount', 'status', 'signature_valid', 'provider_response'
    ];

    // provider: mock, sepay, vnpay, momo
    // status: pending, success, failed
}
```

### 3.5 Chat Models

#### ChatConversation Model

```php
class ChatConversation extends Model
{
    protected $fillable = ['customer_id', 'session_id', 'title'];

    public function customer(): BelongsTo { ... }
    public function messages(): HasMany { ... }
    public function getRecentMessages(int $limit = 10): Collection { ... }
}
```

---

## 4. Services Layer

### 4.1 PaymentService

```php
class PaymentService
{
    // Create payment transaction based on provider (mock/sepay)
    public function createPayment(Order $order): array { ... }

    // Process webhook from payment gateway
    public function processWebhook(string $provider, array $payload): array { ... }

    // Generate VietQR code URL for bank transfer
    private function generateQRCode(Order $order, string $requestId): string { ... }
}
```

### 4.2 GeminiService

```php
class GeminiService
{
    // Send message to Gemini AI
    public function chat(string $message, array $context = []): string { ... }

    // Stream response for real-time display
    public function streamChat(string $message, array $context = []): Generator { ... }

    // Build system prompt with shop context
    private function buildSystemPrompt(): string { ... }
}
```

---

## 5. Authentication System

### 5.1 JWT Configuration

Hệ thống sử dụng **2 JWT Guards riêng biệt**:

```php
// config/auth.php
'guards' => [
    'admin' => [
        'driver' => 'jwt',
        'provider' => 'admins',
    ],
    'customer' => [
        'driver' => 'jwt',
        'provider' => 'customers',
    ],
],

'providers' => [
    'admins' => [
        'driver' => 'eloquent',
        'model' => App\Models\Admin::class,
    ],
    'customers' => [
        'driver' => 'eloquent',
        'model' => App\Models\Customer::class,
    ],
],
```

### 5.2 JWT Token Structure

```json
// Admin Token
{
  "sub": 1,
  "role": "admin",
  "username": "admin",
  "iat": 1735786800,
  "exp": 1735790400
}

// Customer Token
{
  "sub": 1,
  "role": "customer",
  "email": "customer@email.com",
  "iat": 1735786800,
  "exp": 1735790400
}
```

---

## 6. Middleware

### 6.1 Authentication Middleware

```php
// Protected Admin routes
Route::middleware('auth:admin')->group(function () {
    // Admin only routes
});

// Protected Customer routes
Route::middleware('auth:customer')->group(function () {
    // Authenticated customer routes
});
```

---

## 7. Database Layer

### 7.1 Eloquent Relationships

```
Admin (1) ←→ (0) No relationships

Customer (1) ←→ (1) Cart
Customer (1) ←→ (*) Orders
Customer (1) ←→ (*) Reviews
Customer (1) ←→ (*) ChatConversations

Category (1) ←→ (*) Products
Category (1) ←→ (*) Children (self-referencing)

Product (1) ←→ (*) ProductImages
Product (1) ←→ (*) Reviews
Product (1) ←→ (*) CartItems
Product (1) ←→ (*) OrderItems

Cart (1) ←→ (*) CartItems

Order (1) ←→ (*) OrderItems
Order (1) ←→ (1) PaymentTransaction

ChatConversation (1) ←→ (*) ChatMessages
```

### 7.2 Query Scopes

```php
// Product scopes
Product::active()->get();           // is_active = true
Product::featured()->get();         // is_featured = true
Product::inStock()->get();          // stock_quantity > 0

// Category scopes
Category::active()->get();          // is_active = true
Category::root()->get();            // parent_id IS NULL

// Order scopes
Order::byStatus('pending')->get();  // status = 'pending'
Order::pending()->get();            // status = 'pending'
Order::paid()->get();               // payment_status = 'paid'

// Review scopes
Review::approved()->get();          // is_approved = true
```
