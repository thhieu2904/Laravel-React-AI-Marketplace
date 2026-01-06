<?php

use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Auth\CustomerAuthController;
use App\Http\Controllers\Auth\UnifiedAuthController;
use App\Http\Controllers\Customer\CartController;
use App\Http\Controllers\Customer\OrderController;
use App\Http\Controllers\Public\CategoryController;
use App\Http\Controllers\Public\ProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'API is running',
        'timestamp' => now()->toISOString(),
    ]);
});

// ============================================
// UNIFIED AUTH ROUTE (checks both admin and customer)
// ============================================
Route::post('/login', [UnifiedAuthController::class, 'login']);

// ============================================
// PUBLIC ROUTES (No auth required)
// ============================================
Route::prefix('public')->group(function () {
    // Categories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);

    // Products
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/featured', [ProductController::class, 'featured']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
    Route::get('/products/{id}/related', [ProductController::class, 'related']);
});

// ============================================
// CUSTOMER AUTH ROUTES
// ============================================
Route::prefix('customer')->group(function () {
    // Public routes
    Route::post('/register', [CustomerAuthController::class, 'register']);
    Route::post('/login', [CustomerAuthController::class, 'login']);

    // Protected routes
    Route::middleware('auth:customer')->group(function () {
        Route::get('/me', [CustomerAuthController::class, 'me']);
        Route::put('/profile', [CustomerAuthController::class, 'updateProfile']);
        Route::post('/change-password', [CustomerAuthController::class, 'changePassword']);
        Route::post('/account-request', [CustomerAuthController::class, 'requestAccountAction']);
        Route::post('/logout', [CustomerAuthController::class, 'logout']);
        Route::post('/refresh', [CustomerAuthController::class, 'refresh']);
    });
});

// ============================================
// CART ROUTES (Customer protected)
// ============================================
Route::prefix('cart')->middleware('auth:customer')->group(function () {
    Route::get('/', [CartController::class, 'index']);
    Route::post('/', [CartController::class, 'store']);
    Route::put('/{itemId}', [CartController::class, 'update']);
    Route::delete('/{itemId}', [CartController::class, 'destroy']);
    Route::delete('/', [CartController::class, 'clear']);
});

// ============================================
// ORDER ROUTES (Customer protected)
// ============================================
Route::prefix('orders')->middleware('auth:customer')->group(function () {
    Route::get('/', [OrderController::class, 'index']);
    Route::post('/', [OrderController::class, 'store']);
    Route::get('/{orderCode}', [OrderController::class, 'show']);
    Route::post('/{orderCode}/cancel', [OrderController::class, 'cancel']);
});

// ============================================
// ADMIN ROUTES
// ============================================
Route::prefix('admin')->group(function () {
    // Public routes
    Route::post('/login', [AdminAuthController::class, 'login']);

    // Protected routes
    Route::middleware('auth:admin')->group(function () {
        // Auth
        Route::get('/me', [AdminAuthController::class, 'me']);
        Route::post('/logout', [AdminAuthController::class, 'logout']);
        Route::post('/refresh', [AdminAuthController::class, 'refresh']);

        // Categories CRUD
        Route::get('/categories', [AdminCategoryController::class, 'index']);
        Route::get('/categories/{id}', [AdminCategoryController::class, 'show']);
        Route::post('/categories', [AdminCategoryController::class, 'store']);
        Route::put('/categories/{id}', [AdminCategoryController::class, 'update']);
        Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy']);

        // Products CRUD
        Route::get('/products', [AdminProductController::class, 'index']);
        Route::get('/products/{id}', [AdminProductController::class, 'show']);
        Route::post('/products', [AdminProductController::class, 'store']);
        Route::put('/products/{id}', [AdminProductController::class, 'update']);
        Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);
        Route::patch('/products/{id}/toggle-status', [AdminProductController::class, 'toggleStatus']);
        Route::patch('/products/{id}/toggle-featured', [AdminProductController::class, 'toggleFeatured']);

        // Orders
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/stats', [AdminOrderController::class, 'stats']);
        Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
        Route::patch('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);

        // Customers
        Route::get('/customers', [\App\Http\Controllers\Admin\CustomerController::class, 'index']);
        Route::get('/customers/stats', [\App\Http\Controllers\Admin\CustomerController::class, 'stats']);
        Route::get('/customers/{id}', [\App\Http\Controllers\Admin\CustomerController::class, 'show']);
        Route::patch('/customers/{id}/toggle-status', [\App\Http\Controllers\Admin\CustomerController::class, 'toggleStatus']);

        // Reviews
        Route::get('/reviews', [\App\Http\Controllers\Admin\ReviewController::class, 'index']);
        Route::get('/reviews/pending-count', [\App\Http\Controllers\Admin\ReviewController::class, 'pendingCount']);
        Route::patch('/reviews/{id}/approve', [\App\Http\Controllers\Admin\ReviewController::class, 'approve']);
        Route::patch('/reviews/{id}/reject', [\App\Http\Controllers\Admin\ReviewController::class, 'reject']);
        Route::delete('/reviews/{id}', [\App\Http\Controllers\Admin\ReviewController::class, 'destroy']);

        // Stats
        Route::get('/stats/overview', [\App\Http\Controllers\Admin\StatsController::class, 'overview']);
        Route::get('/stats/revenue-chart', [\App\Http\Controllers\Admin\StatsController::class, 'revenueChart']);
        Route::get('/stats/top-products', [\App\Http\Controllers\Admin\StatsController::class, 'topProducts']);
        Route::get('/stats/recent-orders', [\App\Http\Controllers\Admin\StatsController::class, 'recentOrders']);
        Route::get('/stats/orders-by-status', [\App\Http\Controllers\Admin\StatsController::class, 'ordersByStatus']);
    });
});

// ============================================
// REVIEW ROUTES
// ============================================
Route::prefix('reviews')->group(function () {
    // Get product reviews (public)
    Route::get('/product/{productId}', [\App\Http\Controllers\Public\ReviewController::class, 'productReviews']);

    // Customer review routes
    Route::middleware('auth:customer')->group(function () {
        Route::get('/my', [\App\Http\Controllers\Customer\ReviewController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\Customer\ReviewController::class, 'store']);
        Route::put('/{id}', [\App\Http\Controllers\Customer\ReviewController::class, 'update']);
        Route::delete('/{id}', [\App\Http\Controllers\Customer\ReviewController::class, 'destroy']);
    });
});

// ============================================
// PAYMENT ROUTES
// ============================================
Route::prefix('payment')->group(function () {
    // Create payment (customer)
    Route::post('/create', [\App\Http\Controllers\PaymentController::class, 'create'])
        ->middleware('auth:customer');

    // Mock checkout page (for testing)
    Route::get('/mock-checkout', [\App\Http\Controllers\PaymentController::class, 'mockCheckout']);

    // Check payment status
    Route::get('/status/{requestId}', [\App\Http\Controllers\PaymentController::class, 'status']);

    // Webhook (public - called by payment provider)
    Route::post('/webhook/{provider}', [\App\Http\Controllers\PaymentController::class, 'webhook']);
});

// ============================================
// CHAT ROUTES
// ============================================
// ============================================
// CHAT ROUTES
// ============================================
Route::prefix('chat')->group(function () {
    Route::get('/conversation', [\App\Http\Controllers\ChatController::class, 'getConversation']);
    Route::post('/message', [\App\Http\Controllers\ChatController::class, 'sendMessage']);
    Route::get('/stream', [\App\Http\Controllers\ChatController::class, 'streamMessage']);
    Route::get('/history', [\App\Http\Controllers\ChatController::class, 'history']);
});
