<?php
/**
 * Quick API test script
 * Run: php test_api.php
 */

$baseUrl = 'http://127.0.0.1:8000/api';

function request($method, $url, $data = null, $token = null) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    $headers = ['Content-Type: application/json'];
    if ($token) {
        $headers[] = "Authorization: Bearer $token";
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return ['code' => $httpCode, 'body' => json_decode($response, true)];
}

echo "=== API Endpoint Tests ===\n\n";

// 1. Customer Login
echo "1. Customer Login... ";
$login = request('POST', "$baseUrl/customer/login", [
    'email' => 'customer1@gmail.com',
    'password' => 'password123'
]);
if ($login['code'] == 200 && $login['body']['success']) {
    echo "✓ OK\n";
    $token = $login['body']['data']['token'];
} else {
    echo "✗ FAILED\n";
    print_r($login);
    exit(1);
}

// 2. Get Cart
echo "2. Get Cart... ";
$cart = request('GET', "$baseUrl/cart", null, $token);
if ($cart['code'] == 200 && $cart['body']['success']) {
    echo "✓ OK (items: " . count($cart['body']['data']['items']) . ")\n";
} else {
    echo "✗ FAILED\n";
    print_r($cart);
}

// 3. Add to Cart
echo "3. Add to Cart (product_id=2)... ";
$addCart = request('POST', "$baseUrl/cart", [
    'product_id' => 2,
    'quantity' => 1
], $token);
if ($addCart['code'] == 200 && $addCart['body']['success']) {
    echo "✓ OK (total_items: " . $addCart['body']['data']['total_items'] . ")\n";
} else {
    echo "✗ FAILED\n";
    print_r($addCart);
}

// 4. Get Cart again
echo "4. Get Cart again... ";
$cart2 = request('GET', "$baseUrl/cart", null, $token);
if ($cart2['code'] == 200) {
    echo "✓ OK (total: " . number_format($cart2['body']['data']['total_price']) . " VND)\n";
} else {
    echo "✗ FAILED\n";
}

// 5. Get Orders
echo "5. Get Orders... ";
$orders = request('GET', "$baseUrl/orders", null, $token);
if ($orders['code'] == 200 && $orders['body']['success']) {
    echo "✓ OK (count: " . count($orders['body']['data']) . ")\n";
} else {
    echo "✗ FAILED\n";
    print_r($orders);
}

// 6. Admin Login
echo "6. Admin Login... ";
$adminLogin = request('POST', "$baseUrl/admin/login", [
    'email' => 'admin@dienlanh.com',
    'password' => 'admin123'
]);
if ($adminLogin['code'] == 200 && $adminLogin['body']['success']) {
    echo "✓ OK\n";
    $adminToken = $adminLogin['body']['data']['token'];
} else {
    echo "✗ FAILED\n";
    print_r($adminLogin);
    exit(1);
}

// 7. Admin Orders
echo "7. Admin Get Orders... ";
$adminOrders = request('GET', "$baseUrl/admin/orders", null, $adminToken);
if ($adminOrders['code'] == 200 && $adminOrders['body']['success']) {
    echo "✓ OK (total: " . $adminOrders['body']['meta']['total'] . ")\n";
} else {
    echo "✗ FAILED\n";
    print_r($adminOrders);
}

// 8. Admin Order Stats
echo "8. Admin Order Stats... ";
$stats = request('GET', "$baseUrl/admin/orders/stats", null, $adminToken);
if ($stats['code'] == 200 && $stats['body']['success']) {
    echo "✓ OK (total_orders: " . $stats['body']['data']['total_orders'] . ")\n";
} else {
    echo "✗ FAILED\n";
    print_r($stats);
}

// 9. Create Payment (need online order first)
echo "9. Checkout with online payment... ";
// First clear cart and add fresh item
request('DELETE', "$baseUrl/cart", null, $token);
request('POST', "$baseUrl/cart", ['product_id' => 3, 'quantity' => 1], $token);
$checkout = request('POST', "$baseUrl/orders", [
    'shipping_name' => 'Test User',
    'shipping_phone' => '0901234567',
    'shipping_address' => '123 Test Street',
    'payment_method' => 'online',
], $token);
if ($checkout['code'] == 201 && $checkout['body']['success']) {
    echo "✓ OK (order: " . $checkout['body']['data']['order_code'] . ")\n";
    $testOrderCode = $checkout['body']['data']['order_code'];
} else {
    echo "✗ FAILED\n";
    print_r($checkout);
    $testOrderCode = null;
}

// 10. Create Payment
if ($testOrderCode) {
    echo "10. Create Payment... ";
    $payment = request('POST', "$baseUrl/payment/create", ['order_code' => $testOrderCode], $token);
    if ($payment['code'] == 200 && $payment['body']['success']) {
        echo "✓ OK (request_id: " . substr($payment['body']['data']['request_id'], 0, 20) . "...)\n";
        $requestId = $payment['body']['data']['request_id'];
    } else {
        echo "✗ FAILED\n";
        print_r($payment);
        $requestId = null;
    }
} else {
    echo "10. Create Payment... SKIPPED (no order)\n";
    $requestId = null;
}

// 11. Mock Webhook
if ($requestId) {
    echo "11. Mock Webhook (simulate success)... ";
    $webhook = request('POST', "$baseUrl/payment/webhook/mock", [
        'request_id' => $requestId,
        'status' => 'success',
        'transaction_id' => 'MOCK_TXN_' . time(),
    ], null);
    if ($webhook['code'] == 200 && $webhook['body']['success']) {
        echo "✓ OK (payment_status: " . $webhook['body']['payment_status'] . ")\n";
    } else {
        echo "✗ FAILED\n";
        print_r($webhook);
    }
} else {
    echo "11. Mock Webhook... SKIPPED (no request_id)\n";
}

// 12. Check Payment Status
if ($requestId) {
    echo "12. Check Payment Status... ";
    $status = request('GET', "$baseUrl/payment/status/$requestId", null, null);
    if ($status['code'] == 200 && $status['body']['success']) {
        echo "✓ OK (status: " . $status['body']['data']['status'] . ")\n";
    } else {
        echo "✗ FAILED\n";
        print_r($status);
    }
} else {
    echo "12. Check Payment Status... SKIPPED\n";
}

// 13. Chat Conversation (Get/Create)
echo "13. Listen Chat Conversation... ";
$chatConv = request('GET', "$baseUrl/chat/conversation?session_id=test_session_123", null, null);
if ($chatConv['code'] == 200 && $chatConv['body']['success']) {
    echo "✓ OK (id: " . $chatConv['body']['data']['conversation_id'] . ")\n";
    $sessionId = $chatConv['body']['data']['session_id'];
} else {
    echo "✗ FAILED\n";
    print_r($chatConv);
    $sessionId = null;
}

// 14. Send Chat Message (Gemini)
// Note: This calls external API, might be slow or fail if key is invalid
if ($sessionId) {
    echo "14. Send Chat Message (calling Gemini)... ";
    $chatMsg = request('POST', "$baseUrl/chat/message", [
        'session_id' => $sessionId,
        'message' => 'Xin chào, cửa hàng có bán máy lạnh Daikin không?'
    ], null);
    
    if ($chatMsg['code'] == 200 && $chatMsg['body']['success']) {
        echo "✓ OK\n";
        echo "    User: " . $chatMsg['body']['data']['user_message']['content'] . "\n";
        echo "    Bot: " . substr($chatMsg['body']['data']['bot_message']['content'], 0, 100) . "...\n";
    } else {
        echo "✗ FAILED (might be API Key issue)\n";
        // Don't fail the whole script for external API
        if (isset($chatMsg['body']['message'])) {
            echo "    Error: " . $chatMsg['body']['message'] . "\n";
        }
    }
}

echo "\n=== All tests completed ===\n";
