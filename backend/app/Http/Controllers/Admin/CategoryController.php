<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * List all categories (admin view - includes inactive)
     */
    public function index(): JsonResponse
    {
        $categories = Category::with(['children', 'parent:id,name'])
            ->withCount('products')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Get single category
     */
    public function show(int $id): JsonResponse
    {
        $category = Category::with(['children', 'parent'])
            ->withCount('products')
            ->find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy danh mục',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $category,
        ]);
    }

    /**
     * Create new category
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'image' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
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
        while (Category::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }

        $category = Category::create([
            'name' => $request->name,
            'slug' => $slug,
            'parent_id' => $request->parent_id,
            'description' => $request->description,
            'image' => $request->image,
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tạo danh mục thành công',
            'data' => $category,
        ], 201);
    }

    /**
     * Update category
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy danh mục',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:100',
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'image' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Prevent setting parent to self or own children
        if ($request->has('parent_id') && $request->parent_id) {
            if ($request->parent_id == $id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể đặt danh mục cha là chính nó',
                ], 422);
            }
        }

        // Update slug if name changed
        if ($request->has('name') && $request->name !== $category->name) {
            $slug = Str::slug($request->name);
            $originalSlug = $slug;
            $counter = 1;
            while (Category::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = $originalSlug . '-' . $counter++;
            }
            $category->slug = $slug;
        }

        $category->fill($request->only([
            'name', 'parent_id', 'description', 'image', 'sort_order', 'is_active'
        ]));
        $category->save();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật danh mục thành công',
            'data' => $category,
        ]);
    }

    /**
     * Delete category
     */
    public function destroy(int $id): JsonResponse
    {
        $category = Category::withCount('products')->find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy danh mục',
            ], 404);
        }

        // Check if has products
        if ($category->products_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa danh mục có sản phẩm. Vui lòng chuyển sản phẩm sang danh mục khác trước.',
            ], 422);
        }

        // Move children to parent
        Category::where('parent_id', $id)->update(['parent_id' => $category->parent_id]);

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa danh mục thành công',
        ]);
    }
}
