<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * List all customers
     */
    public function index(Request $request): JsonResponse
    {
        $query = Customer::query();

        // Search by name, email, phone
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%$search%")
                    ->orWhere('email', 'like', "%$search%")
                    ->orWhere('phone', 'like', "%$search%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'locked') {
                $query->where('is_active', false);
            }
        }

        $customers = $query->withCount('orders')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $customers->items(),
            'meta' => [
                'current_page' => $customers->currentPage(),
                'last_page' => $customers->lastPage(),
                'per_page' => $customers->perPage(),
                'total' => $customers->total(),
            ],
        ]);
    }

    /**
     * Get customer detail
     */
    public function show(int $id): JsonResponse
    {
        $customer = Customer::with(['orders' => function ($q) {
            $q->latest()->limit(5);
        }])->withCount('orders')->find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy khách hàng',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $customer,
        ]);
    }

    /**
     * Toggle customer active status (lock/unlock)
     */
    public function toggleStatus(int $id): JsonResponse
    {
        $customer = Customer::find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy khách hàng',
            ], 404);
        }

        $customer->is_active = !$customer->is_active;
        $customer->save();

        $statusText = $customer->is_active ? 'kích hoạt' : 'khóa';

        return response()->json([
            'success' => true,
            'message' => "Đã {$statusText} tài khoản khách hàng",
            'data' => $customer,
        ]);
    }

    /**
     * Get customer statistics
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total' => Customer::count(),
                'active' => Customer::where('is_active', true)->count(),
                'locked' => Customer::where('is_active', false)->count(),
                'new_this_month' => Customer::whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
            ],
        ]);
    }
}
