<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Create payment for an order
     */
    public function create(Request $request): JsonResponse
    {
        $request->validate([
            'order_code' => 'required|string',
        ]);

        $customer = auth('customer')->user();

        $order = Order::where('customer_id', $customer->id)
            ->where('order_code', $request->order_code)
            ->where('payment_method', 'online')
            ->where('payment_status', 'pending')
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng hoặc đơn hàng không hợp lệ',
            ], 404);
        }

        // Check if already has pending transaction
        if ($order->paymentTransaction && $order->paymentTransaction->status === 'pending') {
            return response()->json([
                'success' => true,
                'message' => 'Đã có giao dịch đang chờ xử lý',
                'data' => [
                    'request_id' => $order->paymentTransaction->request_id,
                    'payment_url' => config('app.url') . '/api/payment/mock-checkout?' . http_build_query([
                        'request_id' => $order->paymentTransaction->request_id,
                    ]),
                ],
            ]);
        }

        $result = $this->paymentService->createPayment($order);

        return response()->json([
            'success' => $result['success'],
            'message' => $result['message'],
            'data' => $result,
        ]);
    }

    /**
     * Mock checkout page (for testing)
     * In production, this would be the payment gateway's page
     */
    public function mockCheckout(Request $request): JsonResponse
    {
        $requestId = $request->get('request_id');
        $amount = $request->get('amount');
        $orderCode = $request->get('order_code');

        return response()->json([
            'success' => true,
            'message' => 'Mock Payment Page',
            'data' => [
                'request_id' => $requestId,
                'amount' => $amount,
                'order_code' => $orderCode,
                'instructions' => [
                    'To complete payment, call POST /api/payment/webhook/mock with:',
                    '{"request_id": "' . $requestId . '", "status": "success", "transaction_id": "TXN_xxx"}',
                ],
            ],
        ]);
    }

    /**
     * Process webhook from payment provider
     */
    public function webhook(Request $request, string $provider): JsonResponse
    {
        $payload = $request->all();

        // Log webhook for debugging
        \Illuminate\Support\Facades\Log::info("Payment webhook from $provider", $payload);

        $result = $this->paymentService->processWebhook($provider, $payload);

        // Return 200 to acknowledge receipt (important for webhooks)
        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Check payment status
     */
    public function status(string $requestId): JsonResponse
    {
        $transaction = \App\Models\PaymentTransaction::where('request_id', $requestId)
            ->with('order:id,order_code,payment_status')
            ->first();

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy giao dịch',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'request_id' => $transaction->request_id,
                'transaction_id' => $transaction->transaction_id,
                'provider' => $transaction->provider,
                'amount' => $transaction->amount,
                'status' => $transaction->status,
                'order_code' => $transaction->order->order_code,
                'payment_status' => $transaction->order->payment_status,
                'created_at' => $transaction->created_at,
            ],
        ]);
    }
}
