<?php

namespace App\Services;

use App\Models\Order;
use App\Models\PaymentTransaction;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    /**
     * Create payment for an order
     * Returns payment data (QR info for SePay, or mock URL)
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
     * SePay QR Banking Payment
     * Generates QR code info for bank transfer
     * SePay will call IPN webhook when payment received
     */
    protected function createSepayPayment(Order $order, PaymentTransaction $transaction): array
    {
        $sepayConfig = config('services.payment.sepay');
        
        if (empty($sepayConfig['bank_account']) || empty($sepayConfig['bank_name'])) {
            Log::warning('SePay: Bank account not configured, falling back to mock');
            return $this->createMockPayment($order, $transaction);
        }

        // Nội dung chuyển khoản - SePay sẽ match theo content này
        $transferContent = $transaction->request_id;

        // Use test amount if configured (for testing with 1000 VND)
        $testAmount = (int) ($sepayConfig['test_amount'] ?? 0);
        $qrAmount = $testAmount > 0 ? $testAmount : (int) $order->total_amount;
        $displayAmount = (int) $order->total_amount; // Always show real amount to user

        // Build QR code URL using VietQR standard
        $bankCode = $this->getBankCode($sepayConfig['bank_name']);
        $qrUrl = sprintf(
            'https://img.vietqr.io/image/%s-%s-compact2.png?amount=%d&addInfo=%s&accountName=%s',
            $bankCode,
            $sepayConfig['bank_account'],
            $qrAmount, // Use test amount for QR
            urlencode($transferContent),
            urlencode($sepayConfig['account_name'] ?? 'Shop Điện Lạnh')
        );

        $response = [
            'success' => true,
            'provider' => 'sepay',
            'request_id' => $transaction->request_id,
            'payment_method' => 'bank_transfer',
            'qr_code_url' => $qrUrl,
            'bank_info' => [
                'bank_name' => $sepayConfig['bank_name'],
                'account_number' => $sepayConfig['bank_account'],
                'account_name' => $sepayConfig['account_name'] ?? 'NGUYEN THANH HIEU',
                'amount' => $qrAmount, // Show QR amount (test or real)
                'display_amount' => $displayAmount, // Real order amount for display
                'transfer_content' => $transferContent,
            ],
            'message' => 'Quét mã QR hoặc chuyển khoản với nội dung chính xác',
        ];

        // Add test mode indicator
        if ($testAmount > 0) {
            $response['test_mode'] = true;
            $response['message'] = "⚠️ CHẾ ĐỘ TEST: Chuyển {$testAmount}đ thay vì " . number_format($displayAmount) . "đ";
        }

        return $response;
    }

    /**
     * Map bank name to VietQR bank code
     */
    protected function getBankCode(string $bankName): string
    {
        $bankCodes = [
            'MB' => 'MB',
            'MBBank' => 'MB',
            'MB Bank' => 'MB',
            'Techcombank' => 'TCB',
            'TCB' => 'TCB',
            'Vietcombank' => 'VCB',
            'VCB' => 'VCB',
            'BIDV' => 'BIDV',
            'Agribank' => 'AGR',
            'VietinBank' => 'CTG',
            'CTG' => 'CTG',
            'ACB' => 'ACB',
            'VPBank' => 'VPB',
            'VPB' => 'VPB',
            'TPBank' => 'TPB',
            'TPB' => 'TPB',
            'Sacombank' => 'STB',
            'STB' => 'STB',
            'HDBank' => 'HDB',
            'HDB' => 'HDB',
            'OCB' => 'OCB',
            'MSB' => 'MSB',
            'SHB' => 'SHB',
            'VIB' => 'VIB',
            'SeABank' => 'SEAB',
            'SEAB' => 'SEAB',
        ];

        return $bankCodes[$bankName] ?? 'MB';
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

        $transaction->update([
            'transaction_id' => $transactionId,
            'status' => $status,
            'signature_valid' => true,
            'provider_response' => $payload,
        ]);

        if ($status === 'success') {
            $transaction->order->update([
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
     * Process SePay IPN webhook
     * Called by SePay when bank transfer is received
     * 
     * SePay webhook payload structure:
     * {
     *   "id": 12345,                      // SePay transaction ID
     *   "gateway": "MBBank",              // Bank name
     *   "transactionDate": "2024-01-05",  
     *   "accountNumber": "123456789",     // Your bank account
     *   "code": null,                     // Payment code (if any)
     *   "content": "DL240105-001-ABC",    // Transfer content (our request_id)
     *   "transferType": "in",             // 'in' = money received
     *   "transferAmount": 5000000,        // Amount in VND
     *   "accumulated": 5000000,
     *   "referenceCode": "FT24005...",    // Bank reference
     * }
     */
    protected function processSepayWebhook(array $payload): array
    {
        Log::info('SePay webhook received', $payload);

        // Extract request_id from transfer content
        $content = $payload['content'] ?? '';
        $transactionId = $payload['id'] ?? null;
        $transferType = $payload['transferType'] ?? '';
        $amount = $payload['transferAmount'] ?? 0;

        // Only process incoming transfers
        if ($transferType !== 'in') {
            Log::info('SePay: Ignoring outgoing transfer');
            return ['success' => true, 'message' => 'Ignored: not incoming transfer'];
        }

        // Find transaction by content (which is our request_id)
        $requestId = trim($content);
        $transaction = PaymentTransaction::where('request_id', $requestId)->first();

        if (!$transaction) {
            // Try partial match (in case content has extra text)
            $transaction = PaymentTransaction::where('request_id', 'LIKE', '%' . $requestId . '%')
                ->where('status', 'pending')
                ->first();
        }

        if (!$transaction) {
            Log::warning('SePay: Transaction not found for content: ' . $content);
            return ['success' => false, 'message' => 'Transaction not found'];
        }

        if (!$transaction->canBeProcessed()) {
            Log::info('SePay: Transaction already processed', ['request_id' => $requestId]);
            return ['success' => true, 'message' => 'Transaction already processed'];
        }

        // Verify amount matches (within 1% tolerance for rounding)
        $expectedAmount = (int) $transaction->amount;
        $receivedAmount = (int) $amount;
        if ($receivedAmount < $expectedAmount * 0.99) {
            Log::warning('SePay: Amount mismatch', [
                'expected' => $expectedAmount,
                'received' => $receivedAmount,
            ]);
            return ['success' => false, 'message' => 'Amount mismatch'];
        }

        // Update transaction
        $transaction->update([
            'transaction_id' => (string) $transactionId,
            'status' => 'success',
            'signature_valid' => true,
            'provider_response' => $payload,
        ]);

        // Update order
        $transaction->order->update([
            'payment_status' => 'paid',
            'paid_at' => now(),
        ]);

        Log::info('SePay: Payment success', [
            'order_code' => $transaction->order->order_code,
            'amount' => $receivedAmount,
        ]);

        return [
            'success' => true,
            'message' => 'Payment confirmed',
            'order_code' => $transaction->order->order_code,
        ];
    }
}
