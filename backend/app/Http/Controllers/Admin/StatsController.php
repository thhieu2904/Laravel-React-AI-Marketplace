<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    /**
     * Dashboard overview statistics
     */
    public function overview(): JsonResponse
    {
        $today = now()->startOfDay();
        $thisMonth = now()->startOfMonth();
        $lastMonth = now()->subMonth()->startOfMonth();
        $lastMonthEnd = now()->subMonth()->endOfMonth();

        $stats = [
            // Order stats
            'orders' => [
                'total' => Order::count(),
                'today' => Order::where('created_at', '>=', $today)->count(),
                'this_month' => Order::where('created_at', '>=', $thisMonth)->count(),
                'pending' => Order::where('status', 'pending')->count(),
                'processing' => Order::whereIn('status', ['confirmed', 'shipping'])->count(),
                'delivered' => Order::where('status', 'delivered')->count(),
                'cancelled' => Order::where('status', 'cancelled')->count(),
            ],

            // Revenue stats
            'revenue' => [
                'total' => Order::where('status', 'delivered')->sum('total_amount'),
                'today' => Order::where('status', 'delivered')
                    ->where('created_at', '>=', $today)
                    ->sum('total_amount'),
                'this_month' => Order::where('status', 'delivered')
                    ->where('created_at', '>=', $thisMonth)
                    ->sum('total_amount'),
                'last_month' => Order::where('status', 'delivered')
                    ->whereBetween('created_at', [$lastMonth, $lastMonthEnd])
                    ->sum('total_amount'),
            ],

            // Product stats
            'products' => [
                'total' => Product::count(),
                'active' => Product::where('is_active', true)->count(),
                'out_of_stock' => Product::where('stock_quantity', 0)->count(),
                'low_stock' => Product::where('stock_quantity', '>', 0)
                    ->where('stock_quantity', '<=', 5)
                    ->count(),
            ],

            // Customer stats
            'customers' => [
                'total' => Customer::count(),
                'active' => Customer::where('is_active', true)->count(),
                'new_this_month' => Customer::where('created_at', '>=', $thisMonth)->count(),
            ],

            // Review stats
            'reviews' => [
                'total' => Review::count(),
                'pending' => Review::where('is_approved', false)->count(),
                'approved' => Review::where('is_approved', true)->count(),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Revenue chart data (last 30 days)
     */
    public function revenueChart(Request $request): JsonResponse
    {
        $days = $request->get('days', 30);
        $startDate = now()->subDays($days - 1)->startOfDay();

        $revenueByDay = Order::where('status', 'delivered')
            ->where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as orders')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Fill in missing dates
        $chart = [];
        for ($i = 0; $i < $days; $i++) {
            $date = now()->subDays($days - 1 - $i)->format('Y-m-d');
            $chart[] = [
                'date' => $date,
                'revenue' => (float) ($revenueByDay[$date]->revenue ?? 0),
                'orders' => (int) ($revenueByDay[$date]->orders ?? 0),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $chart,
        ]);
    }

    /**
     * Top selling products
     */
    public function topProducts(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 10);

        $topProducts = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.status', 'delivered')
            ->select(
                'products.id',
                'products.name',
                'products.slug',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.total_price) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.slug')
            ->orderBy('total_sold', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $topProducts,
        ]);
    }

    /**
     * Recent orders
     */
    public function recentOrders(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 10);

        $orders = Order::with('customer:id,full_name,email')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get(['id', 'customer_id', 'order_code', 'total_amount', 'status', 'created_at']);

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Order status breakdown
     */
    public function ordersByStatus(): JsonResponse
    {
        $breakdown = Order::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        return response()->json([
            'success' => true,
            'data' => $breakdown,
        ]);
    }
}
