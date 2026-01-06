<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * List all products (admin view)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category:id,name', 'images' => function ($q) {
            $q->where('is_primary', true);
        }]);

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

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
     * Get single product
     */
    public function show(int $id): JsonResponse
    {
        $product = Product::with(['category', 'images'])->find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    /**
     * Create new product
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'original_price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'nullable|integer|min:0',
            'brand' => 'nullable|string|max:100',
            'specifications' => 'nullable|array',
            'is_featured' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'images' => 'nullable|array',
            'images.*.url' => 'required_with:images|string|max:255',
            'images.*.is_primary' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Generate unique slug
        $slug = Str::slug($request->name);
        $originalSlug = $slug;
        $counter = 1;
        while (Product::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }

        DB::beginTransaction();
        try {
            $product = Product::create([
                'category_id' => $request->category_id,
                'name' => $request->name,
                'slug' => $slug,
                'short_description' => $request->short_description,
                'description' => $request->description,
                'original_price' => $request->original_price,
                'sale_price' => $request->sale_price,
                'stock_quantity' => $request->stock_quantity ?? 0,
                'brand' => $request->brand,
                'specifications' => $request->specifications,
                'is_featured' => $request->is_featured ?? false,
                'is_active' => $request->is_active ?? true,
            ]);

            // Create images
            if ($request->has('images')) {
                foreach ($request->images as $index => $image) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_url' => $image['url'],
                        'sort_order' => $index,
                        'is_primary' => $image['is_primary'] ?? ($index === 0),
                    ]);
                }
            }

            DB::commit();

            $product->load('images');

            return response()->json([
                'success' => true,
                'message' => 'Tạo sản phẩm thành công',
                'data' => $product,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update product
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|required|exists:categories,id',
            'name' => 'sometimes|required|string|max:255',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'original_price' => 'sometimes|required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'nullable|integer|min:0',
            'brand' => 'nullable|string|max:100',
            'specifications' => 'nullable|array',
            'is_featured' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'images' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Update slug if name changed
        if ($request->has('name') && $request->name !== $product->name) {
            $slug = Str::slug($request->name);
            $originalSlug = $slug;
            $counter = 1;
            while (Product::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = $originalSlug . '-' . $counter++;
            }
            $product->slug = $slug;
        }

        $product->fill($request->only([
            'category_id', 'name', 'short_description', 'description',
            'original_price', 'sale_price', 'stock_quantity', 'brand',
            'specifications', 'is_featured', 'is_active'
        ]));
        $product->save();

        // Update images if provided
        if ($request->has('images')) {
            // Delete old images
            ProductImage::where('product_id', $id)->delete();
            
            // Create new images
            foreach ($request->images as $index => $image) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => $image['url'],
                    'sort_order' => $index,
                    'is_primary' => $image['is_primary'] ?? ($index === 0),
                ]);
            }
        }

        $product->load('images');

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật sản phẩm thành công',
            'data' => $product,
        ]);
    }

    /**
     * Delete product
     */
    public function destroy(int $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm',
            ], 404);
        }

        // Delete images first (cascade should handle this but being explicit)
        ProductImage::where('product_id', $id)->delete();
        
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa sản phẩm thành công',
        ]);
    }

    /**
     * Toggle product status
     */
    public function toggleStatus(int $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm',
            ], 404);
        }

        $product->is_active = !$product->is_active;
        $product->save();

        return response()->json([
            'success' => true,
            'message' => $product->is_active ? 'Đã kích hoạt sản phẩm' : 'Đã ẩn sản phẩm',
            'data' => $product,
        ]);
    }

    /**
     * Toggle product featured status
     */
    public function toggleFeatured(int $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm',
            ], 404);
        }

        $product->is_featured = !$product->is_featured;
        $product->save();

        return response()->json([
            'success' => true,
            'message' => $product->is_featured ? 'Đã đánh dấu nổi bật' : 'Đã bỏ đánh dấu nổi bật',
            'data' => $product,
        ]);
    }
}
