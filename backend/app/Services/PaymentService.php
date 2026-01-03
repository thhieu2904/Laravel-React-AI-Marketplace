<?php

namespace App\Services;

use App\Models\Order;
use App\Models\PaymentTransaction;

class PaymentService
{
    /**
     * Create payment for an order
     * Returns payment URL or data based on provider
     */
    public function createPayment(Order $order): array
    {
        $provider = config('services.payment.provider', 'mock');

        // Generate unique request ID for webhook mapping
        $requestId = PaymentTransaction::generateRequestId($order->order_code);

        // Create transaction record
        $transaction = PaymentTransaction::create([
            'order_id' => $order->id,
            'request_id' => $requestId,
            'provider' => $provider,
            'amount' => $order->total_amount,
            'status' => 'pending',
        ]);

        // Route to appropriate provider
        return match ($provider) {
            'mock' => $this->createMockPayment($order, $transaction),
            'sepay' => $this->createSepayPayment($order, $transaction),
            default => $this->createMockPayment($order, $transaction),
        };
    }

    /**
     * Mock payment for development/testing
     */
    protected function createMockPayment(Order $order, PaymentTransaction $transaction): array
    {
        // In mock mode, return a simulated payment URL
        $mockPaymentUrl = config('app.url') . '/api/payment/mock-checkout?' . http_build_query([
            'request_id' => $transaction->request_id,
            'amount' => $order->total_amount,
            'order_code' => $order->order_code,
        ]);

        return [
            'success' => true,
            'provider' => 'mock',
            'request_id' => $transaction->request_id,
            'payment_url' => $mockPaymentUrl,
            'message' => 'Redirect to mock payment page',
        ];
    }

    /**
     * SePay payment integration (placeholder)
     * Will be implemented when SePay API key is available
     */
    protected function createSepayPayment(Order $order, PaymentTransaction $transaction): array
    {
        $sepayApiKey = config('services.payment.sepay_api_key');

        if (empty($sepayApiKey)) {
            // Fallback to mock if no API key
            return $this->createMockPayment($order, $transaction);
        }

        // TODO: Implement actual SePay API call
        // SePay integration steps:
        // 1. Call SePay API to create payment intent
        // 2. Get payment URL from response
        // 3. Return URL for redirect

        return [
            'success' => true,
            'provider' => 'sepay',
            'request_id' => $transaction->request_id,
            'payment_url' => 'https://sepay.vn/pay/...',
            'message' => 'Redirect to SePay payment page',
        ];
    }

    /**
     * Process webhook from payment provider
     */
    public function processWebhook(string $provider, array $payload): array
    {
        return match ($provider) {
            'mock' => $this->processMockWebhook($payload),
            'sepay' => $this->processSepayWebhook($payload),
            default => ['success' => false, 'message' => 'Unknown provider'],
        };
    }

    /**
     * Process mock webhook (for testing)
     */
    protected function processMockWebhook(array $payload): array
    {
        $requestId = $payload['request_id'] ?? null;
        $status = $payload['status'] ?? 'success';
        $transactionId = $payload['transaction_id'] ?? 'MOCK_TXN_' . time();

        if (!$requestId) {
            return ['success' => false, 'message' => 'Missing request_id'];
        }

        $transaction = PaymentTransaction::where('request_id', $requestId)->first();

        if (!$transaction) {
            return ['success' => false, 'message' => 'Transaction not found'];
        }

        if (!$transaction->canBeProcessed()) {
            return ['success' => false, 'message' => 'Transaction already processed'];
        }

        // Update transaction
        $transaction->update([
            'transaction_id' => $transactionId,
            'status' => $status,
            'signature_valid' => true, // Mock always valid
            'provider_response' => $payload,
        ]);

        // Update order if payment successful
        if ($status === 'success') {
            $order = $transaction->order;
            $order->update([
                'payment_status' => 'paid',
                'paid_at' => now(),
            ]);
        }

        return [
            'success' => true,
            'message' => 'Webhook processed',
            'order_code' => $transaction->order->order_code,
            'payment_status' => $status,
        ];
    }

    /**
     * Process SePay webhook (placeholder)
     */
    protected function processSepayWebhook(array $payload): array
    {
        // TODO: Implement actual SePay webhook verification
        // Steps:
        // 1. Verify signature using SePay secret
        // 2. Extract request_id and status from payload
        // 3. Update transaction and order

        $requestId = $payload['reference'] ?? $payload['request_id'] ?? null;
        $status = $payload['status'] ?? null;
        $transactionId = $payload['transaction_id'] ?? null;

        // Map SePay status to our status
        $mappedStatus = match ($status) {
            'PAID', 'SUCCESS', 'COMPLETED' => 'success',
            'FAILED', 'CANCELLED' => 'failed',
            default => 'pending',
        };

        if (!$requestId) {
            return ['success' => false, 'message' => 'Missing reference/request_id'];
        }

        $transaction = PaymentTransaction::where('request_id', $requestId)->first();

        if (!$transaction) {
            return ['success' => false, 'message' => 'Transaction not found'];
        }

        // Verify signature (placeholder - implement with actual SePay logic)
        $signatureValid = $this->verifySepaySignature($payload);

        $transaction->update([
            'transaction_id' => $transactionId,
            'status' => $mappedStatus,
            'signature_valid' => $signatureValid,
            'provider_response' => $payload,
        ]);

        if ($mappedStatus === 'success' && $signatureValid) {
            $transaction->order->update([
                'payment_status' => 'paid',
                'paid_at' => now(),
            ]);
        }

        return [
            'success' => true,
            'message' => 'SePay webhook processed',
        ];
    }

    /**
     * Verify SePay webhook signature (placeholder)
     */
    protected function verifySepaySignature(array $payload): bool
    {
        // TODO: Implement actual signature verification
        // Usually: hash_hmac('sha256', $data, $secret) === $signature
        return true;
    }
}
