# CẤU TRÚC BÁO CÁO ĐỒNG ÁN - 6 CHƯƠNG

---

## **CHƯƠNG 1: GIỚI THIỆU & PHÂN TÍCH BÀI TOÁN**
*(2-3 trang)*

### 1.1 Giới thiệu dự án
- Tên dự án: Website Bán Điện Lạnh
- Mục đích: Xây dựng hệ thống e-commerce chuyên bán sản phẩm điện lạnh
- Phạm vi: Web application với admin dashboard

### 1.2 Phân tích bài toán
- **Khách hàng cần gì?**
  - Hệ thống bán hàng trực tuyến đầy đủ
  - Quản lý sản phẩm, đơn hàng, khách hàng
  - Hỗ trợ thanh toán online
  - Chat với bot AI để tư vấn sản phẩm

- **Yêu cầu chức năng:**
  - Khách hàng: Duyệt sản phẩm, mua hàng, theo dõi đơn, đánh giá
  - Admin: Quản lý sản phẩm, danh mục, đơn hàng, khách hàng, thống kê
  - Thanh toán: QR code VietQR, SePay payment gateway
  - AI Chat: Hỗ trợ khách hàng 24/7

- **Yêu cầu phi chức năng:**
  - Bảo mật: JWT authentication
  - Hiệu năng: Response time < 200ms
  - Khả năng mở rộng: Dễ thêm chức năng mới

### 1.3 Các công nghệ lựa chọn & lý do
- **Backend**: Laravel 12 - Framework PHP hiện đại, MVC pattern rõ ràng
- **Frontend**: React 18 - Component-based, state management tốt
- **Database**: MySQL 8.0 - Cơ sở dữ liệu quan hệ, InnoDB engine
- **Authentication**: JWT - Stateless, phù hợp với RESTful API
- **External Services**: Google Gemini (AI), SePay (thanh toán), Cloudinary (storage)

### 1.4 Sơ đồ kiến trúc tổng thể
```
┌─────────────────────┐         ┌──────────────────┐
│   FRONTEND (React)  │◄────────│   BACKEND API    │
│   Port: 5173        │ RESTful │   Laravel 12     │
└─────────────────────┘ JSON    │   Port: 8000     │
                                └────────┬─────────┘
                                         │
                                    MySQL │
                                         │
                                ┌────────▼─────────┐
                                │   Database       │
                                │   MySQL 8.0      │
                                │   13 Tables      │
                                └──────────────────┘
```

---

## **CHƯƠNG 2: KIẾN TRÚC & THIẾT KẾ BACKEND (LARAVEL)**
*(3-4 trang)*

### 2.1 Kiến trúc MVC Pattern
Laravel sử dụng mô hình **Model-View-Controller**:

```
User Request → Routes → Controller → Model → Database
                          ↓
                       Service Layer
                          ↓
                        Response
```

**Tại sao MVC?**
- Tách biệt logic: Controller xử lý request, Model xử lý dữ liệu
- Dễ bảo trì: Mỗi lớp có trách nhiệm riêng
- Dễ test: Có thể test từng phần độc lập
- Tái sử dụng code: Models và logic có thể dùng ở nhiều nơi

### 2.2 Cấu trúc thư mục Backend
```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/          ← Controller Layer
│   │   │   ├── Admin/            (6 controllers)
│   │   │   ├── Auth/             (2 controllers)
│   │   │   ├── Customer/         (3 controllers)
│   │   │   └── Public/           (3 controllers)
│   │   ├── Middleware/           ← Middleware (Auth, CORS, etc)
│   │   └── Requests/             ← Form Requests (validation)
│   │
│   ├── Models/                   ← Model Layer (13 models)
│   │   ├── User.php
│   │   ├── Product.php
│   │   ├── Category.php
│   │   ├── Order.php
│   │   └── ... (13 models total)
│   │
│   ├── Services/                 ← Business Logic Layer
│   │   ├── PaymentService.php
│   │   └── GeminiService.php
│   │
│   ├── Events/ & Listeners/      ← Event-driven programming
│   ├── Exceptions/               ← Custom exceptions
│   └── Providers/                ← Service container
│
├── config/                       ← Configuration
│   ├── auth.php                  (JWT, guards)
│   ├── database.php
│   ├── services.php
│   └── app.php
│
├── database/
│   ├── migrations/               ← Database schema
│   ├── factories/                ← Test data factories
│   └── seeders/                  ← Database seeders
│
├── routes/
│   └── api.php                   ← API routes (50+ endpoints)
│
└── .env                          ← Environment variables
```

### 2.3 Các lớp trong kiến trúc

#### **2.3.1 Controllers Layer**
**Chức năng:** Nhận request từ client, gọi Models/Services xử lý, trả về response

**Phân loại Controllers:**
- **Auth Controllers** (2): Xử lý đăng nhập, đăng ký
- **Admin Controllers** (6): Quản lý sản phẩm, danh mục, đơn hàng, khách hàng, đánh giá
- **Customer Controllers** (3): Giỏ hàng, đơn hàng, đánh giá
- **Public Controllers** (3): Danh sách sản phẩm, danh mục (không cần login)

**Ví dụ Controller:**
```php
// admin/ProductController.php
public function store(StoreProductRequest $request)
{
    // $request tự động validate
    $product = Product::create($request->validated());
    return response()->json($product, 201);
}
```

#### **2.3.2 Models Layer - Eloquent ORM**
**Chức năng:** Đại diện cho bảng trong database, xử lý logic dữ liệu

**13 Models chính:**
```
Admin ─┬─ has many ─→ Product
       ├─ has many ─→ Category
       └─ has many ─→ Order

Customer ─┬─ has many ─→ Order
          ├─ has many ─→ Review
          ├─ has one ─→ Cart
          └─ has many ─→ ChatConversation

Product ─┬─ belongs to ─→ Category
         ├─ has many ─→ ProductImage
         ├─ has many through ─→ Order (through OrderItem)
         └─ has many ─→ Review

Cart ─┬─ has many ─→ CartItem
      └─ belongs to ─→ Customer

Order ─┬─ has many ─→ OrderItem
       ├─ has many through ─→ Product (through OrderItem)
       ├─ has one ─→ PaymentTransaction
       └─ belongs to ─→ Customer
```

**Eloquent Features:**
- **Relationships**: hasMany, belongsTo, belongsToMany
- **Scopes**: Local scopes (filter dữ liệu), Global scopes
- **Accessors & Mutators**: Chuyển đổi dữ liệu khi lấy/lưu
- **Soft Deletes**: Xóa mềm (giữ dữ liệu, đánh dấu deleted_at)
- **Timestamps**: Tự động tạo created_at, updated_at

**Ví dụ Model:**
```php
class Product extends Model
{
    // Relationships
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    
    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }
    
    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
    
    public function scopePriceRange($query, $min, $max)
    {
        return $query->whereBetween('price', [$min, $max]);
    }
}
```

#### **2.3.3 Routes & API Design**
**Route Groups & Middleware:**
```php
// api.php
Route::prefix('api')->group(function () {
    // Public routes (no auth)
    Route::get('public/products', [ProductController::class, 'index']);
    
    // Auth routes
    Route::post('customer/register', [AuthController::class, 'register']);
    Route::post('customer/login', [AuthController::class, 'login']);
    
    // Protected routes (require customer auth)
    Route::middleware(['auth:customer'])->group(function () {
        Route::get('customer/me', [CustomerController::class, 'me']);
        Route::post('customer/cart', [CartController::class, 'store']);
    });
    
    // Admin routes (require admin auth)
    Route::middleware(['auth:admin'])->group(function () {
        Route::apiResource('admin/products', ProductController::class);
        Route::apiResource('admin/categories', CategoryController::class);
    });
});
```

#### **2.3.4 Middleware & Authentication**
**JWT Authentication:**
- Sử dụng package `tymon/jwt-auth`
- Tạo token khi login: `\Auth::guard('customer')->attempt(credentials)`
- Validate token ở mỗi protected request

**Custom Middleware:**
```php
class Authenticate extends Middleware
{
    protected $guards = ['customer', 'admin'];
    
    public function handle($request, Closure $next, ...$guards)
    {
        // Validate token từ header Authorization
        // Nếu invalid, throw exception
    }
}
```

#### **2.3.5 Service Layer - Business Logic**
**Chức năng:** Xử lý logic phức tạp, tách biệt khỏi Controller

**PaymentService:**
```php
class PaymentService
{
    // Tạo QR code VietQR
    public function generateQRCode($amount, $orderId)
    {
        // Tính toán QR data
        // Gọi API SePay
        // Trả về QR code URL
    }
    
    // Verify thanh toán
    public function verifyPayment($transactionId)
    {
        // Kiểm tra với SePay
        // Cập nhật trạng thái Order
    }
}
```

**GeminiService:**
```php
class GeminiService
{
    // AI Chat
    public function chat($message, $conversationId)
    {
        // Gọi Google Gemini API
        // Trả về response
    }
}
```

### 2.4 Request & Response Format
**Request (JSON):**
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**Response (JSON):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "email": "user@example.com",
        "token": "eyJ0eXAi..."
    },
    "message": "Login successful"
}
```

### 2.5 Error Handling & Validation
**Form Request Validation:**
```php
class StoreProductRequest extends FormRequest
{
    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id'
        ];
    }
}
```

**Exception Handling:**
```php
// Tự động validate và throw ValidationException nếu sai
// Trả về JSON response với lỗi
```

---

## **CHƯƠNG 3: DATABASE & MODELS CHI TIẾT**
*(3 trang)*

### 3.1 Sơ đồ ER (Entity Relationship)
```
ADMINS
  ├── id (PK)
  ├── email
  └── password

CUSTOMERS
  ├── id (PK)
  ├── email
  ├── password
  ├── full_name
  ├── phone
  └── address

CATEGORIES
  ├── id (PK)
  ├── name
  ├── slug
  └── admin_id (FK)

PRODUCTS
  ├── id (PK)
  ├── name
  ├── slug
  ├── description
  ├── price
  ├── category_id (FK)
  ├── admin_id (FK)
  └── is_active

PRODUCT_IMAGES
  ├── id (PK)
  ├── product_id (FK)
  ├── image_url
  └── position

CARTS
  ├── id (PK)
  └── customer_id (FK)

CART_ITEMS
  ├── id (PK)
  ├── cart_id (FK)
  ├── product_id (FK)
  └── quantity

ORDERS
  ├── id (PK)
  ├── order_number
  ├── customer_id (FK)
  ├── total_amount
  ├── status (pending, confirmed, shipped, delivered, cancelled)
  └── created_at

ORDER_ITEMS
  ├── id (PK)
  ├── order_id (FK)
  ├── product_id (FK)
  └── quantity

REVIEWS
  ├── id (PK)
  ├── product_id (FK)
  ├── customer_id (FK)
  ├── rating
  └── comment

PAYMENT_TRANSACTIONS
  ├── id (PK)
  ├── order_id (FK)
  ├── transaction_id
  ├── status (pending, success, failed)
  └── created_at

CHAT_CONVERSATIONS
  ├── id (PK)
  └── customer_id (FK)

CHAT_MESSAGES
  ├── id (PK)
  ├── conversation_id (FK)
  ├── sender_type (customer, bot)
  ├── message
  └── created_at
```

### 3.2 Chi tiết 13 Models

#### **Model 1: Admin**
```php
class Admin extends Model
{
    protected $fillable = ['email', 'password', 'name'];
    protected $hidden = ['password'];
    
    public function categories() { return $this->hasMany(Category::class); }
    public function products() { return $this->hasMany(Product::class); }
}
```

#### **Model 2: Customer**
```php
class Customer extends Model
{
    protected $fillable = ['email', 'password', 'full_name', 'phone', 'address'];
    protected $hidden = ['password'];
    
    public function orders() { return $this->hasMany(Order::class); }
    public function reviews() { return $this->hasMany(Review::class); }
    public function cart() { return $this->hasOne(Cart::class); }
    public function chatConversations() { return $this->hasMany(ChatConversation::class); }
}
```

#### **Model 3: Category**
```php
class Category extends Model
{
    protected $fillable = ['name', 'slug', 'admin_id'];
    
    public function products() { return $this->hasMany(Product::class); }
    public function admin() { return $this->belongsTo(Admin::class); }
}
```

#### **Model 4: Product**
```php
class Product extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'price', 'category_id', 'admin_id', 'is_active'];
    protected $casts = ['price' => 'decimal:2'];
    
    public function category() { return $this->belongsTo(Category::class); }
    public function images() { return $this->hasMany(ProductImage::class); }
    public function reviews() { return $this->hasMany(Review::class); }
    public function orderItems() { return $this->hasMany(OrderItem::class); }
    
    // Scope
    public function scopeActive($query) { return $query->where('is_active', true); }
    public function scopePriceRange($query, $min, $max) { return $query->whereBetween('price', [$min, $max]); }
}
```

#### **Model 5: ProductImage**
```php
class ProductImage extends Model
{
    protected $fillable = ['product_id', 'image_url', 'position'];
    
    public function product() { return $this->belongsTo(Product::class); }
}
```

#### **Model 6: Cart**
```php
class Cart extends Model
{
    protected $fillable = ['customer_id'];
    
    public function customer() { return $this->belongsTo(Customer::class); }
    public function items() { return $this->hasMany(CartItem::class); }
}
```

#### **Model 7: CartItem**
```php
class CartItem extends Model
{
    protected $fillable = ['cart_id', 'product_id', 'quantity'];
    
    public function cart() { return $this->belongsTo(Cart::class); }
    public function product() { return $this->belongsTo(Product::class); }
}
```

#### **Model 8: Order**
```php
class Order extends Model
{
    protected $fillable = ['order_number', 'customer_id', 'total_amount', 'status'];
    
    public function customer() { return $this->belongsTo(Customer::class); }
    public function items() { return $this->hasMany(OrderItem::class); }
    public function paymentTransaction() { return $this->hasOne(PaymentTransaction::class); }
    
    // Scope
    public function scopePending($query) { return $query->where('status', 'pending'); }
}
```

#### **Model 9: OrderItem**
```php
class OrderItem extends Model
{
    protected $fillable = ['order_id', 'product_id', 'quantity'];
    
    public function order() { return $this->belongsTo(Order::class); }
    public function product() { return $this->belongsTo(Product::class); }
}
```

#### **Model 10: Review**
```php
class Review extends Model
{
    protected $fillable = ['product_id', 'customer_id', 'rating', 'comment'];
    protected $casts = ['rating' => 'integer'];
    
    public function product() { return $this->belongsTo(Product::class); }
    public function customer() { return $this->belongsTo(Customer::class); }
}
```

#### **Model 11: PaymentTransaction**
```php
class PaymentTransaction extends Model
{
    protected $fillable = ['order_id', 'transaction_id', 'status'];
    
    public function order() { return $this->belongsTo(Order::class); }
}
```

#### **Model 12: ChatConversation**
```php
class ChatConversation extends Model
{
    protected $fillable = ['customer_id'];
    
    public function customer() { return $this->belongsTo(Customer::class); }
    public function messages() { return $this->hasMany(ChatMessage::class); }
}
```

#### **Model 13: ChatMessage**
```php
class ChatMessage extends Model
{
    protected $fillable = ['conversation_id', 'sender_type', 'message'];
    
    public function conversation() { return $this->belongsTo(ChatConversation::class); }
}
```

### 3.3 Migrations - Tạo bảng
**Migrations là PHP files để tạo/sửa schema database**

```php
// database/migrations/2024_01_01_create_products_table.php
public function up()
{
    Schema::create('products', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('slug')->unique();
        $table->text('description');
        $table->decimal('price', 10, 2);
        $table->foreignId('category_id')->constrained();
        $table->foreignId('admin_id')->constrained('admins');
        $table->boolean('is_active')->default(true);
        $table->timestamps();
        
        $table->index('category_id');
        $table->index('created_at');
    });
}
```

### 3.4 Relationships & Queries
**Eager Loading:**
```php
// Lấy sản phẩm cùng danh mục (1 query)
$products = Product::with('category')->get();

// Lấy đơn hàng cùng các items và sản phẩm (1 query)
$orders = Order::with('items.product')->get();
```

**Lazy Loading (tránh):**
```php
// ❌ Tránh - N+1 query problem
$products = Product::all();
foreach ($products as $product) {
    echo $product->category->name; // N queries!
}
```

---

## **CHƯƠNG 4: API ENDPOINTS & CHỨC NĂNG**
*(3-4 trang)*

### 4.1 Phân loại Endpoints

#### **Public Endpoints (Không cần auth)**
| Method | Endpoint | Chức năng | Controller |
|--------|----------|----------|-----------|
| GET | `/public/categories` | Lấy danh sách danh mục | CategoryController |
| GET | `/public/categories/{slug}` | Chi tiết danh mục | CategoryController |
| GET | `/public/products` | Lấy danh sách sản phẩm | ProductController |
| GET | `/public/products/featured` | Sản phẩm nổi bật | ProductController |
| GET | `/public/products/{slug}` | Chi tiết sản phẩm | ProductController |
| GET | `/public/products/{id}/related` | Sản phẩm liên quan | ProductController |
| GET | `/reviews/product/{productId}` | Đánh giá sản phẩm | ReviewController |

#### **Customer Auth Endpoints**
| Method | Endpoint | Chức năng | Auth |
|--------|----------|----------|------|
| POST | `/customer/register` | Đăng ký tài khoản | ❌ |
| POST | `/customer/login` | Đăng nhập | ❌ |
| GET | `/customer/me` | Thông tin tài khoản | ✅ |
| PUT | `/customer/profile` | Cập nhật profile | ✅ |
| POST | `/customer/change-password` | Đổi mật khẩu | ✅ |
| POST | `/customer/logout` | Đăng xuất | ✅ |

#### **Customer Shopping Endpoints**
| Method | Endpoint | Chức năng |
|--------|----------|----------|
| POST | `/customer/cart` | Thêm vào giỏ |
| GET | `/customer/cart` | Xem giỏ hàng |
| PUT | `/customer/cart/{itemId}` | Sửa số lượng |
| DELETE | `/customer/cart/{itemId}` | Xóa khỏi giỏ |
| POST | `/customer/cart/checkout` | Thanh toán |
| GET | `/customer/orders` | Lịch sử đơn hàng |
| GET | `/customer/orders/{id}` | Chi tiết đơn hàng |
| POST | `/customer/reviews` | Đánh giá sản phẩm |

#### **Admin Endpoints**
| Method | Endpoint | Chức năng | Auth |
|--------|----------|----------|------|
| POST | `/admin/login` | Admin login | ❌ |
| GET | `/admin/categories` | Danh sách danh mục | ✅ |
| POST | `/admin/categories` | Tạo danh mục | ✅ |
| PUT | `/admin/categories/{id}` | Sửa danh mục | ✅ |
| DELETE | `/admin/categories/{id}` | Xóa danh mục | ✅ |
| GET | `/admin/products` | Danh sách sản phẩm | ✅ |
| POST | `/admin/products` | Tạo sản phẩm | ✅ |
| PUT | `/admin/products/{id}` | Sửa sản phẩm | ✅ |
| DELETE | `/admin/products/{id}` | Xóa sản phẩm | ✅ |
| GET | `/admin/orders` | Danh sách đơn hàng | ✅ |
| PUT | `/admin/orders/{id}/status` | Cập nhật trạng thái | ✅ |
| GET | `/admin/stats` | Thống kê dashboard | ✅ |

### 4.2 Chi tiết Controllers

#### **4.2.1 Auth/CustomerAuthController**
```php
class CustomerAuthController extends Controller
{
    // Register
    public function register(RegisterRequest $request)
    {
        $customer = Customer::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'full_name' => $request->full_name,
            'phone' => $request->phone,
            'address' => $request->address
        ]);
        
        $token = auth('customer')->login($customer);
        
        return response()->json([
            'success' => true,
            'data' => ['token' => $token, 'user' => $customer],
            'message' => 'Registration successful'
        ], 201);
    }
    
    // Login
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();
        
        if (!$token = auth('customer')->attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }
        
        return response()->json([
            'success' => true,
            'data' => ['token' => $token],
            'expires_in' => auth('customer')->factory()->getTTL() * 60
        ]);
    }
    
    // Logout
    public function logout()
    {
        auth('customer')->logout();
        return response()->json(['success' => true, 'message' => 'Logged out']);
    }
}
```

#### **4.2.2 Public/ProductController**
```php
class ProductController extends Controller
{
    // Lấy danh sách sản phẩm
    public function index(Request $request)
    {
        $query = Product::active()->with('category', 'images');
        
        // Filter
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }
        
        if ($request->has('min_price') && $request->has('max_price')) {
            $query->whereBetween('price', [
                $request->min_price,
                $request->max_price
            ]);
        }
        
        // Sort
        if ($request->has('sort')) {
            switch ($request->sort) {
                case 'price_asc':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'desc');
                    break;
                case 'newest':
                    $query->orderBy('created_at', 'desc');
                    break;
            }
        }
        
        $products = $query->paginate($request->get('per_page', 12));
        
        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }
    
    // Chi tiết sản phẩm
    public function show($slug)
    {
        $product = Product::where('slug', $slug)
            ->active()
            ->with(['category', 'images', 'reviews.customer'])
            ->firstOrFail();
        
        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }
    
    // Sản phẩm liên quan
    public function related($id)
    {
        $product = Product::findOrFail($id);
        
        $related = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->active()
            ->limit(6)
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $related
        ]);
    }
}
```

#### **4.2.3 Admin/ProductController**
```php
class ProductController extends Controller
{
    // Tạo sản phẩm
    public function store(StoreProductRequest $request)
    {
        $product = Product::create([
            ...$request->validated(),
            'admin_id' => auth('admin')->id(),
            'slug' => Str::slug($request->name)
        ]);
        
        // Lưu ảnh
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $url = $image->store('products', 'cloudinary');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => $url,
                    'position' => $index
                ]);
            }
        }
        
        return response()->json([
            'success' => true,
            'data' => $product->load('images'),
            'message' => 'Product created'
        ], 201);
    }
    
    // Sửa sản phẩm
    public function update(UpdateProductRequest $request, $id)
    {
        $product = Product::findOrFail($id);
        $product->update($request->validated());
        
        return response()->json([
            'success' => true,
            'data' => $product,
            'message' => 'Product updated'
        ]);
    }
    
    // Xóa sản phẩm
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Product deleted'
        ]);
    }
}
```

#### **4.2.4 Customer/CartController**
```php
class CartController extends Controller
{
    // Thêm vào giỏ
    public function store(AddToCartRequest $request)
    {
        $customer = auth('customer')->user();
        $cart = $customer->cart ?: Cart::create(['customer_id' => $customer->id]);
        
        $item = CartItem::updateOrCreate(
            ['cart_id' => $cart->id, 'product_id' => $request->product_id],
            ['quantity' => $request->quantity]
        );
        
        return response()->json([
            'success' => true,
            'data' => $item,
            'message' => 'Added to cart'
        ]);
    }
    
    // Xem giỏ
    public function show()
    {
        $cart = auth('customer')->user()->cart;
        
        return response()->json([
            'success' => true,
            'data' => $cart ? $cart->load('items.product') : null
        ]);
    }
}
```

#### **4.2.5 Customer/OrderController**
```php
class OrderController extends Controller
{
    // Checkout
    public function checkout(CheckoutRequest $request)
    {
        $customer = auth('customer')->user();
        $cart = $customer->cart;
        
        // Tạo order
        $order = Order::create([
            'order_number' => 'ORD-' . time(),
            'customer_id' => $customer->id,
            'total_amount' => $cart->items->sum(fn($item) => 
                $item->product->price * $item->quantity
            ),
            'status' => 'pending'
        ]);
        
        // Tạo order items
        foreach ($cart->items as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item->product_id,
                'quantity' => $item->quantity
            ]);
        }
        
        // Tạo thanh toán
        $qrUrl = app(PaymentService::class)->generateQRCode(
            $order->total_amount,
            $order->id
        );
        
        // Xóa giỏ hàng
        $cart->items()->delete();
        
        return response()->json([
            'success' => true,
            'data' => [
                'order' => $order->load('items'),
                'qr_url' => $qrUrl
            ],
            'message' => 'Order created'
        ], 201);
    }
}
```

### 4.3 Request/Response Examples

#### **Register Request**
```json
POST /api/customer/register
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "full_name": "John Doe",
    "phone": "0901234567",
    "address": "123 Main St"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "email": "john@example.com",
        "full_name": "John Doe",
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    },
    "message": "Registration successful"
}
```

#### **Get Products Request**
```
GET /api/public/products?category_id=1&min_price=5000000&max_price=20000000&sort=price_asc&page=1&per_page=12
```

**Response:**
```json
{
    "success": true,
    "data": {
        "data": [
            {
                "id": 1,
                "name": "Máy lạnh Daikin",
                "slug": "may-lanh-daikin",
                "price": 12000000,
                "category": {...},
                "images": [...]
            }
        ],
        "pagination": {
            "total": 150,
            "per_page": 12,
            "current_page": 1,
            "last_page": 13
        }
    }
}
```

---

## **CHƯƠNG 5: BẢO MẬT & BEST PRACTICES**
*(2-3 trang)*

### 5.1 Authentication - JWT (JSON Web Token)

**Cách hoạt động:**
```
1. User login → API tạo token JWT
2. Client lưu token → Gửi token ở header Authorization
3. API validate token → Xác định user
4. Response dữ liệu
```

**Flow:**
```php
// 1. Login - Tạo token
$credentials = ['email' => $email, 'password' => $password];
$token = auth('customer')->attempt($credentials);

// 2. Client gửi request
// Header: Authorization: Bearer <token>

// 3. Middleware validate
protected $guards = ['customer']; // Validate token

// 4. Access user
$user = auth('customer')->user();
```

**JWT Token Structure:**
```
Header.Payload.Signature

Header: {"typ": "JWT", "alg": "HS256"}
Payload: {"sub": 1, "email": "user@example.com", "exp": 1234567890}
Signature: HMACSHA256(Header.Payload, secret_key)
```

**Ưu điểm JWT:**
- Stateless: Không cần lưu session trên server
- Scalable: Phù hợp với microservices
- Mobile-friendly: Dễ sử dụng trên mobile app

### 5.2 Authorization - Role-Based Access Control

**Guards & Roles:**
```php
// Middleware định nghĩa role
Route::middleware(['auth:admin'])->group(function () {
    // Chỉ admin có thể truy cập
});

Route::middleware(['auth:customer'])->group(function () {
    // Chỉ customer có thể truy cập
});

// Custom authorization
public function update(Request $request, Product $product)
{
    // Chỉ admin tạo sản phẩm này mới được sửa
    $this->authorize('update', $product);
    
    $product->update($request->all());
}
```

### 5.3 Input Validation & Sanitization

**Form Request Validation:**
```php
class StoreProductRequest extends FormRequest
{
    public function authorize()
    {
        return auth('admin')->check();
    }
    
    public function rules()
    {
        return [
            'name' => 'required|string|max:255|unique:products',
            'description' => 'required|string|min:10',
            'price' => 'required|numeric|min:0|max:1000000000',
            'category_id' => 'required|integer|exists:categories,id',
            'images' => 'required|array|min:1|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg|max:5120'
        ];
    }
    
    public function messages()
    {
        return [
            'name.required' => 'Tên sản phẩm bắt buộc',
            'price.numeric' => 'Giá phải là số',
            'images.max' => 'Tối đa 5 ảnh'
        ];
    }
}
```

### 5.4 SQL Injection Prevention

**❌ Nguy hiểm:**
```php
// Raw SQL - dễ bị SQL injection
$products = DB::select("SELECT * FROM products WHERE id = " . $id);
```

**✅ An toàn:**
```php
// Eloquent ORM - tự động escape
$product = Product::find($id);

// Query Builder - Parameterized queries
$products = DB::select("SELECT * FROM products WHERE id = ?", [$id]);
```

### 5.5 Password Security

**Hash password khi lưu:**
```php
// ❌ Không bao giờ lưu plaintext
$customer->password = $request->password;

// ✅ Hash bằng bcrypt
$customer->password = Hash::make($request->password);

// Verify khi login
if (Hash::check($request->password, $customer->password)) {
    // Correct
}
```

**Mutators:**
```php
protected function password(): Attribute
{
    return Attribute::make(
        set: fn ($value) => Hash::make($value),
    );
}
```

### 5.6 CORS & API Security

**CORS Config:**
```php
// config/cors.php
'allowed_origins' => ['http://localhost:5173', 'https://yourdomain.com'],
'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE'],
'allowed_headers' => ['Content-Type', 'Authorization']
```

### 5.7 Environment Variables

**Bảo mật sensitive data:**
```bash
# .env file (KHÔNG COMMIT vào git)
DB_PASSWORD=secret_password
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_api_key
SEPAY_API_KEY=your_api_key
```

```php
// Sử dụng trong code
$secret = env('JWT_SECRET');
```

### 5.8 Rate Limiting

**Giới hạn request:**
```php
Route::middleware('throttle:60,1')->group(function () {
    // Max 60 requests per 1 minute
    Route::post('customer/login', [...]);
});
```

### 5.9 HTTPS & Encryption

**Sử dụng HTTPS:**
- Encrypt data in transit
- Prevent man-in-the-middle attacks

**Encrypt sensitive data:**
```php
// Encrypt
$encrypted = encrypt('sensitive_data');

// Decrypt
$data = decrypt($encrypted);
```

---

## **CHƯƠNG 6: TRIỂN KHAI, TESTING & KẾT LUẬN**
*(2-3 trang)*

### 6.1 Triển khai trên XAMPP

#### **6.1.1 Yêu cầu**
- XAMPP đã cài đặt (PHP 8.2+, MySQL 8.0)
- Composer (quản lý package PHP)
- Node.js & npm (cho frontend)

#### **6.1.2 Setup Backend**

**Bước 1: Clone/Copy dự án**
```bash
cd c:\xampp\htdocs\WEBSITE_DIENLANH\backend
```

**Bước 2: Cài đặt dependencies**
```bash
composer install
```

**Bước 3: Tạo .env file**
```bash
cp .env.example .env
php artisan key:generate
```

**Bước 4: Database Configuration**
```env
# .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dienlanh_shop
DB_USERNAME=root
DB_PASSWORD=
```

**Bước 5: Tạo database**
```bash
php artisan migrate
php artisan db:seed
```

**Bước 6: Chạy server**
```bash
php artisan serve
# http://localhost:8000
```

#### **6.1.3 Setup Frontend**

**Bước 1: Cài dependencies**
```bash
cd c:\xampp\htdocs\WEBSITE_DIENLANH\frontend
npm install
```

**Bước 2: Tạo .env**
```env
VITE_API_URL=http://localhost:8000/api
```

**Bước 3: Chạy dev server**
```bash
npm run dev
# http://localhost:5173
```

### 6.2 Testing

#### **6.2.1 Unit Tests**
```php
// tests/Unit/Models/ProductTest.php
class ProductTest extends TestCase
{
    public function test_product_has_category()
    {
        $product = Product::factory()->create();
        $this->assertNotNull($product->category);
    }
    
    public function test_product_price_is_decimal()
    {
        $product = Product::factory()
            ->create(['price' => 1234567.89]);
        $this->assertEquals(1234567.89, $product->price);
    }
}
```

#### **6.2.2 Feature Tests (API Tests)**
```php
// tests/Feature/Api/ProductApiTest.php
class ProductApiTest extends TestCase
{
    public function test_can_list_products()
    {
        $response = $this->getJson('/api/public/products');
        
        $response->assertStatus(200);
        $response->assertJsonStructure(['success', 'data']);
    }
    
    public function test_can_filter_by_category()
    {
        $category = Category::factory()->create();
        Product::factory(5)->create(['category_id' => $category->id]);
        
        $response = $this->getJson("/api/public/products?category_id={$category->id}");
        
        $response->assertStatus(200)
            ->assertJsonCount(5, 'data.data');
    }
    
    public function test_login_required_for_cart()
    {
        $response = $this->postJson('/api/customer/cart', []);
        
        $response->assertStatus(401);
    }
}
```

#### **6.2.3 API Testing Tools**
- **Postman**: GUI tool để test API
- **Laravel Tinker**: REPL interactive
  ```bash
  php artisan tinker
  >>> $product = Product::first();
  >>> $product->reviews;
  ```

### 6.3 Performance Optimization

**1. Database Indexing:**
```php
// Migration
$table->index('category_id');
$table->fullText('name', 'description'); // Full-text search
```

**2. Query Optimization:**
```php
// ❌ N+1 problem
foreach (Product::all() as $product) {
    echo $product->category->name;
}

// ✅ Eager loading
Product::with('category')->get();
```

**3. Caching:**
```php
// Cache query result 1 hour
$products = Cache::remember('featured-products', 3600, function () {
    return Product::featured()->get();
});
```

**4. Pagination:**
```php
// Tránh lấy toàn bộ records
$products = Product::paginate(12); // 12 per page
```

### 6.4 Troubleshooting

| Vấn đề | Nguyên nhân | Giải pháp |
|--------|-----------|---------|
| `Class not found` | Autoloader chưa update | `composer dump-autoload` |
| `Token expired` | JWT hết hạn | Client lấy token mới (refresh) |
| `CORS error` | Domain không được phép | Thêm vào `config/cors.php` |
| `Column not found` | Migration chưa chạy | `php artisan migrate` |
| `Database error` | Kết nối DB sai | Kiểm tra .env DB_* variables |

### 6.5 Lessons Learned & Best Practices

#### **6.5.1 Kiến trúc & Design Patterns**
- **MVC Pattern**: Tách biệt concerns, dễ maintain
- **Service Layer**: Business logic tách khỏi Controller
- **Repository Pattern**: Nếu dự án phức tạp hơn
- **Dependency Injection**: Container quản lý dependencies

#### **6.5.2 Code Quality**
- Luôn validate input (Form Request)
- Sử dụng Eloquent thay raw SQL
- Eager load relationships (with)
- Viết unit tests cho logic phức tạp

#### **6.5.3 Security**
- Hash password, never store plaintext
- Validate & sanitize mọi input
- Sử dụng JWT cho stateless auth
- Protect sensitive data (API keys, passwords) trong .env
- CORS configuration for frontend

#### **6.5.4 Performance**
- Index database columns được query nhiều
- Pagination cho large datasets
- Caching cho data thường xuyên được truy cập
- Eager loading thay lazy loading

---

### 6.6 Kết luận

**Dự án này minh họa:**

1. **Laravel Framework**:
   - Cấu trúc MVC rõ ràng
   - Eloquent ORM mạnh mẽ
   - Routing & Middleware linh hoạt
   - Service Container & Dependency Injection

2. **RESTful API Design**:
   - Proper HTTP methods (GET, POST, PUT, DELETE)
   - Meaningful status codes (200, 201, 400, 401, 404)
   - JSON response format
   - Pagination & filtering

3. **Security Best Practices**:
   - JWT authentication
   - Input validation
   - SQL injection prevention
   - Password encryption

4. **Database Design**:
   - Proper relationships & constraints
   - Migrations for version control
   - Indexing for performance

5. **Integration Points**:
   - Google Gemini API (AI)
   - SePay API (Payment)
   - Cloudinary API (Image Storage)

**Hướng phát triển tương lai:**
- Admin dashboard thêm analytics
- Push notifications
- Email verification
- Two-factor authentication
- API versioning
- GraphQL API alternative
- Microservices architecture
- Mobile app (React Native)
- Advanced search (Elasticsearch)
- Admin moderation queue

---

**END OF DOCUMENT**
