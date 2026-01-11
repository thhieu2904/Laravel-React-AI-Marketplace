<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Get approved reviews for a product
     */
    public function productReviews(int $productId, Request $request): JsonResponse
    {
        $reviews = Review::where('product_id', $productId)
            ->where('is_approved', true)
            ->with('customer:id,full_name')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 10));

        // Calculate rating summary
        $allReviews = Review::where('product_id', $productId)
            ->where('is_approved', true);

        $summary = [
            'total_reviews' => $allReviews->count(),
            'average_rating' => round($allReviews->avg('rating') ?? 0, 1),
            'rating_breakdown' => [
                5 => Review::where('product_id', $productId)->where('is_approved', true)->where('rating', 5)->count(),
                4 => Review::where('product_id', $productId)->where('is_approved', true)->where('rating', 4)->count(),
                3 => Review::where('product_id', $productId)->where('is_approved', true)->where('rating', 3)->count(),
                2 => Review::where('product_id', $productId)->where('is_approved', true)->where('rating', 2)->count(),
                1 => Review::where('product_id', $productId)->where('is_approved', true)->where('rating', 1)->count(),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $reviews->items(),
            'summary' => $summary,
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }
}
