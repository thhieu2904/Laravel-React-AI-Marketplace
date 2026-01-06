<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    /**
     * Get customer's cart with items
     */
    public function index(): JsonResponse
    {
        $customer = auth('customer')->user();

        $cart = Cart::with(['items.product' => function ($q) {
            $q->select('id', 'name', 'slug', 'original_price', 'sale_price', 'stock_quantity')
                ->with(['images' => function ($q2) {
                    $q2->where('is_primary', true)->select('product_id', 'image_url');
                }]);
        }])->firstOrCreate(['customer_id' => $customer->id]);

        // Format response
        $items = $cart->items->map(function ($item) {
            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product' => [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                    'original_price' => $item->product->original_price,
                    'sale_price' => $item->product->sale_price,
                    'current_price' => $item->product->sale_price ?? $item->product->original_price,
                    'stock_quantity' => $item->product->stock_quantity,
                    'image' => $item->product->images->first()?->image_url,
                ],
                'quantity' => $item->quantity,
                'subtotal' => $item->subtotal,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $cart->id,
                'items' => $items,
                'total_items' => $cart->total_items,
                'total_price' => $cart->total_price,
            ],
        ]);
    }

    /**
     * Add item to cart
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $customer = auth('customer')->user();
        $product = Product::find($request->product_id);

        // Check if product is active
        if (!$product->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Sản phẩm không khả dụng',
            ], 400);
        }

        // Check stock
        if ($product->stock_quantity < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Sản phẩm không đủ số lượng trong kho',
                'available' => $product->stock_quantity,
            ], 400);
        }

        // Get or create cart
        $cart = Cart::firstOrCreate(['customer_id' => $customer->id]);

        // Check if item already in cart
        $existingItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($existingItem) {
            $newQuantity = $existingItem->quantity + $request->quantity;

            // Check stock for total quantity
            if ($product->stock_quantity < $newQuantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Số lượng vượt quá tồn kho',
                    'available' => $product->stock_quantity,
                    'in_cart' => $existingItem->quantity,
                ], 400);
            }

            $existingItem->quantity = $newQuantity;
            $existingItem->save();
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
            ]);
        }

        // Reload cart
        $cart->load('items');

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm vào giỏ hàng',
            'data' => [
                'total_items' => $cart->total_items,
                'total_price' => $cart->total_price,
            ],
        ]);
    }

    /**
     * Update cart item quantity
     */
    public function update(Request $request, int $itemId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $customer = auth('customer')->user();
        $cart = Cart::where('customer_id', $customer->id)->first();

        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Giỏ hàng trống',
            ], 404);
        }

        $item = CartItem::where('id', $itemId)
            ->where('cart_id', $cart->id)
            ->first();

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm trong giỏ',
            ], 404);
        }

        // Check stock
        if ($item->product->stock_quantity < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Số lượng vượt quá tồn kho',
                'available' => $item->product->stock_quantity,
            ], 400);
        }

        $item->quantity = $request->quantity;
        $item->save();

        $cart->load('items');

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật giỏ hàng',
            'data' => [
                'total_items' => $cart->total_items,
                'total_price' => $cart->total_price,
            ],
        ]);
    }

    /**
     * Remove item from cart
     */
    public function destroy(int $itemId): JsonResponse
    {
        $customer = auth('customer')->user();
        $cart = Cart::where('customer_id', $customer->id)->first();

        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Giỏ hàng trống',
            ], 404);
        }

        $item = CartItem::where('id', $itemId)
            ->where('cart_id', $cart->id)
            ->first();

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm trong giỏ',
            ], 404);
        }

        $item->delete();

        $cart->load('items');

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa sản phẩm khỏi giỏ hàng',
            'data' => [
                'total_items' => $cart->total_items,
                'total_price' => $cart->total_price,
            ],
        ]);
    }

    /**
     * Clear all items from cart
     */
    public function clear(): JsonResponse
    {
        $customer = auth('customer')->user();
        $cart = Cart::where('customer_id', $customer->id)->first();

        if ($cart) {
            CartItem::where('cart_id', $cart->id)->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa toàn bộ giỏ hàng',
        ]);
    }
}
