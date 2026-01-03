<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * List all reviews (admin view)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Review::with([
            'customer:id,email,full_name',
            'product:id,name,slug'
        ]);

        // Filter by approval status
        if ($request->has('is_approved')) {
            $query->where('is_approved', $request->boolean('is_approved'));
        }

        // Filter by rating
        if ($request->has('rating')) {
            $query->where('rating', $request->rating);
        }

        // Filter by product
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        $reviews = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $reviews->items(),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    /**
     * Approve a review
     */
    public function approve(int $id): JsonResponse
    {
        $review = Review::find($id);

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đánh giá',
            ], 404);
        }

        $review->is_approved = true;
        $review->save();

        return response()->json([
            'success' => true,
            'message' => 'Đã duyệt đánh giá',
            'data' => $review,
        ]);
    }

    /**
     * Reject/unapprove a review
     */
    public function reject(int $id): JsonResponse
    {
        $review = Review::find($id);

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đánh giá',
            ], 404);
        }

        $review->is_approved = false;
        $review->save();

        return response()->json([
            'success' => true,
            'message' => 'Đã từ chối đánh giá',
            'data' => $review,
        ]);
    }

    /**
     * Delete a review
     */
    public function destroy(int $id): JsonResponse
    {
        $review = Review::find($id);

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

    /**
     * Get pending reviews count
     */
    public function pendingCount(): JsonResponse
    {
        $count = Review::where('is_approved', false)->count();

        return response()->json([
            'success' => true,
            'data' => ['pending_count' => $count],
        ]);
    }
}
