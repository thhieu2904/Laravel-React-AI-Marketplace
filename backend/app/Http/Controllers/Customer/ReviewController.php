<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Get customer's reviews
     */
    public function index(): JsonResponse
    {
        $customer = auth('customer')->user();

        $reviews = Review::where('customer_id', $customer->id)
            ->with('product:id,name,slug')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reviews,
        ]);
    }

    /**
     * Create a review for a product
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $customer = auth('customer')->user();

        // Check if already reviewed this product
        $existingReview = Review::where('customer_id', $customer->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($existingReview) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn đã đánh giá sản phẩm này rồi',
            ], 400);
        }

        // Optional: Check if customer has purchased this product
        $hasPurchased = Order::where('customer_id', $customer->id)
            ->where('status', 'delivered')
            ->whereHas('items', function ($q) use ($request) {
                $q->where('product_id', $request->product_id);
            })
            ->exists();

        if (!$hasPurchased) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn cần mua sản phẩm này trước khi đánh giá',
            ], 400);
        }

        $review = Review::create([
            'customer_id' => $customer->id,
            'product_id' => $request->product_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'is_approved' => false, // Require admin approval
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đánh giá đã được gửi, chờ duyệt',
            'data' => $review,
        ], 201);
    }

    /**
     * Update a review
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $customer = auth('customer')->user();

        $review = Review::where('id', $id)
            ->where('customer_id', $customer->id)
            ->first();

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đánh giá',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'rating' => 'sometimes|required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $review->update($request->only(['rating', 'comment']));
        $review->is_approved = false; // Reset approval after edit

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật đánh giá',
            'data' => $review,
        ]);
    }

    /**
     * Delete a review
     */
    public function destroy(int $id): JsonResponse
    {
        $customer = auth('customer')->user();

        $review = Review::where('id', $id)
            ->where('customer_id', $customer->id)
            ->first();

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đánh giá',
            ], 404);
        }

        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa đánh giá',
        ]);
    }
}
