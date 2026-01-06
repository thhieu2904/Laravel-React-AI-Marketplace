<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Get customer's orders
     */
    public function index(Request $request): JsonResponse
    {
        $customer = auth('customer')->user();

        $query = Order::where('customer_id', $customer->id)
            ->with(['items' => function ($q) {
                $q->select('id', 'order_id', 'product_name', 'product_image', 'quantity', 'unit_price', 'total_price');
            }]);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 10));

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
    public function show(string $orderCode): JsonResponse
    {
        $customer = auth('customer')->user();

        $order = Order::where('customer_id', $customer->id)
            ->where('order_code', $orderCode)
            ->with(['items', 'paymentTransaction'])
            ->first();

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
     * Create order from cart (checkout)
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'shipping_name' => 'required|string|max:100',
            'shipping_phone' => 'required|string|max:20',
            'shipping_address' => 'required|string',
            'payment_method' => 'required|in:cod,bank_transfer,online',
            'note' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $customer = auth('customer')->user();

        // Get cart with items
        $cart = Cart::where('customer_id', $customer->id)
            ->with(['items.product'])
            ->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Giỏ hàng trống',
            ], 400);
        }

        // Validate stock for all items
        foreach ($cart->items as $item) {
            if (!$item->product->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => "Sản phẩm '{$item->product->name}' không còn khả dụng",
                ], 400);
            }

            if ($item->product->stock_quantity < $item->quantity) {
                return response()->json([
                    'success' => false,
                    'message' => "Sản phẩm '{$item->product->name}' chỉ còn {$item->product->stock_quantity} trong kho",
                ], 400);
            }
        }

        DB::beginTransaction();
        try {
            // Calculate totals
            $subtotal = $cart->total_price;
            $shippingFee = $subtotal >= 5000000 ? 0 : 50000; // Free shipping for orders >= 5M
            $totalAmount = $subtotal + $shippingFee;

            // Create order
            $order = Order::create([
                'customer_id' => $customer->id,
                'order_code' => Order::generateOrderCode(),
                'subtotal' => $subtotal,
                'shipping_fee' => $shippingFee,
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'payment_method' => $request->payment_method,
                'payment_status' => $request->payment_method === 'cod' ? 'pending' : 'pending',
                'shipping_name' => $request->shipping_name,
                'shipping_phone' => $request->shipping_phone,
                'shipping_address' => $request->shipping_address,
                'note' => $request->note,
            ]);

            // Create order items and update stock
            foreach ($cart->items as $item) {
                $product = $item->product;
                $price = $product->sale_price ?? $product->original_price;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_image' => $product->images->first()?->image_url,
                    'quantity' => $item->quantity,
                    'unit_price' => $price,
                    'total_price' => $price * $item->quantity,
                ]);

                // Decrease stock
                $product->decrement('stock_quantity', $item->quantity);
            }

            // Clear cart
            CartItem::where('cart_id', $cart->id)->delete();

            DB::commit();

            $order->load('items');

            return response()->json([
                'success' => true,
                'message' => 'Đặt hàng thành công',
                'data' => $order,
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
     * Cancel order
     */
    public function cancel(string $orderCode): JsonResponse
    {
        $customer = auth('customer')->user();

        $order = Order::where('customer_id', $customer->id)
            ->where('order_code', $orderCode)
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng',
            ], 404);
        }

        if (!$order->canBeCancelled()) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể hủy đơn hàng ở trạng thái này',
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Restore stock
            foreach ($order->items as $item) {
                Product::where('id', $item->product_id)
                    ->increment('stock_quantity', $item->quantity);
            }

            $order->status = 'cancelled';
            $order->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Đã hủy đơn hàng',
                'data' => $order,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage(),
            ], 500);
        }
    }
}
