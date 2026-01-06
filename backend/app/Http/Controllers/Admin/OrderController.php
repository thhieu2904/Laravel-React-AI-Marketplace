<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * List all orders (admin view)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['customer:id,email,full_name,phone', 'items']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by payment status
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Search by order code or customer name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_code', 'like', "%$search%")
                    ->orWhereHas('customer', function ($q2) use ($search) {
                        $q2->where('full_name', 'like', "%$search%")
                            ->orWhere('phone', 'like', "%$search%");
                    });
            });
        }

        // Date range
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $orders = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * Get single order detail
     */
    public function show(int $id): JsonResponse
    {
        $order = Order::with(['customer', 'items', 'paymentTransaction'])
            ->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,shipping,delivered,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng',
            ], 404);
        }

        // Validate status transition
        $validTransitions = [
            'pending' => ['confirmed', 'cancelled'],
            'confirmed' => ['shipping', 'cancelled'],
            'shipping' => ['delivered'],
            'delivered' => [],
            'cancelled' => [],
        ];

        if (!in_array($request->status, $validTransitions[$order->status])) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể chuyển từ trạng thái "' . $order->status . '" sang "' . $request->status . '"',
            ], 400);
        }

        // If delivered and COD, mark as paid
        if ($request->status === 'delivered' && $order->payment_method === 'cod') {
            $order->payment_status = 'paid';
            $order->paid_at = now();
        }

        $order->status = $request->status;
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật trạng thái đơn hàng',
            'data' => $order,
        ]);
    }

    /**
     * Get order statistics
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total_orders' => Order::count(),
            'pending' => Order::where('status', 'pending')->count(),
            'confirmed' => Order::where('status', 'confirmed')->count(),
            'shipping' => Order::where('status', 'shipping')->count(),
            'delivered' => Order::where('status', 'delivered')->count(),
            'cancelled' => Order::where('status', 'cancelled')->count(),
            'total_revenue' => Order::where('status', 'delivered')->sum('total_amount'),
            'today_orders' => Order::whereDate('created_at', today())->count(),
            'today_revenue' => Order::whereDate('created_at', today())
                ->where('status', 'delivered')
                ->sum('total_amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
