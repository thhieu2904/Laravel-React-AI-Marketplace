<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * List all active products with filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::active()
            ->with(['category:id,name,slug', 'images' => function ($q) {
                $q->where('is_primary', true);
            }]);

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by brand
        if ($request->has('brand')) {
            $query->where('brand', $request->brand);
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where(function ($q) use ($request) {
                $q->where('sale_price', '>=', $request->min_price)
                    ->orWhere(function ($q2) use ($request) {
                        $q2->whereNull('sale_price')
                            ->where('original_price', '>=', $request->min_price);
                    });
            });
        }

        if ($request->has('max_price')) {
            $query->where(function ($q) use ($request) {
                $q->where('sale_price', '<=', $request->max_price)
                    ->orWhere(function ($q2) use ($request) {
                        $q2->whereNull('sale_price')
                            ->where('original_price', '<=', $request->max_price);
                    });
            });
        }

        // Filter featured
        if ($request->boolean('featured')) {
            $query->featured();
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Sort
        $sortBy = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        
        if ($sortBy === 'price') {
            $query->orderByRaw('COALESCE(sale_price, original_price) ' . $sortOrder);
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Pagination
        $perPage = min($request->get('per_page', 12), 50);
        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Get product detail by slug
     */
    public function show(string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)
            ->active()
            ->with(['category:id,name,slug', 'images', 'reviews' => function ($q) {
                $q->where('is_approved', true)
                    ->with('customer:id,full_name,avatar')
                    ->latest()
                    ->limit(10);
            }])
            ->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm',
            ], 404);
        }

        // Increment view count
        $product->increment('view_count');

        // Add computed attributes
        $product->current_price = $product->current_price;
        $product->discount_percent = $product->discount_percent;
        $product->average_rating = $product->average_rating;
        $product->review_count = $product->reviews()->where('is_approved', true)->count();

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    /**
     * Get featured products
     */
    public function featured(): JsonResponse
    {
        $products = Product::active()
            ->featured()
            ->with(['category:id,name,slug', 'images' => function ($q) {
                $q->where('is_primary', true);
            }])
            ->limit(8)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Get related products
     */
    public function related(int $productId): JsonResponse
    {
        $product = Product::find($productId);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm',
            ], 404);
        }

        $related = Product::active()
            ->where('id', '!=', $productId)
            ->where('category_id', $product->category_id)
            ->with(['images' => function ($q) {
                $q->where('is_primary', true);
            }])
            ->limit(4)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $related,
        ]);
    }
}
