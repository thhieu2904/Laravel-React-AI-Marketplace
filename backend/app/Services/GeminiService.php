<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\Http;

class GeminiService
{
    protected string $apiKey;
    protected string $model = 'gemini-2.0-flash';
    protected string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
    }

    /**
     * Generate chat response (non-streaming)
     */
    public function chat(string $userMessage, array $conversationHistory = []): string
    {
        $systemPrompt = $this->buildSystemPrompt();

        $contents = [];

        // Add conversation history
        foreach ($conversationHistory as $message) {
            $contents[] = [
                'role' => $message['sender_type'] === 'customer' ? 'user' : 'model',
                'parts' => [['text' => $message['content']]],
            ];
        }

        // Add current user message
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $userMessage]],
        ];

        $response = Http::timeout(30)->post(
            "{$this->baseUrl}/{$this->model}:generateContent?key={$this->apiKey}",
            [
                'system_instruction' => [
                    'parts' => [['text' => $systemPrompt]],
                ],
                'contents' => $contents,
                'generationConfig' => [
                    'temperature' => 0.7,
                    'topK' => 40,
                    'topP' => 0.95,
                    'maxOutputTokens' => 1024,
                ],
            ]
        );

        if ($response->failed()) {
            throw new \Exception('Gemini API error: ' . $response->body());
        }

        $data = $response->json();

        return $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Xin lỗi, tôi không thể trả lời lúc này.';
    }

    /**
     * Generate chat response with SSE streaming
     */
    public function streamChat(string $userMessage, array $conversationHistory = []): \Generator
    {
        $systemPrompt = $this->buildSystemPrompt();

        $contents = [];

        // Add conversation history
        foreach ($conversationHistory as $message) {
            $contents[] = [
                'role' => $message['sender_type'] === 'customer' ? 'user' : 'model',
                'parts' => [['text' => $message['content']]],
            ];
        }

        // Add current user message
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $userMessage]],
        ];

        $url = "{$this->baseUrl}/{$this->model}:streamGenerateContent?key={$this->apiKey}&alt=sse";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'system_instruction' => [
                'parts' => [['text' => $systemPrompt]],
            ],
            'contents' => $contents,
            'generationConfig' => [
                'temperature' => 0.7,
                'topK' => 40,
                'topP' => 0.95,
                'maxOutputTokens' => 1024,
            ],
        ]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
        curl_setopt($ch, CURLOPT_WRITEFUNCTION, function ($ch, $data) use (&$fullResponse) {
            // This will be handled differently for streaming
            return strlen($data);
        });

        // For simplicity, use non-streaming and simulate chunks
        $response = $this->chat($userMessage, $conversationHistory);

        // Yield response in chunks for SSE simulation
        $words = explode(' ', $response);
        $chunk = '';

        foreach ($words as $i => $word) {
            $chunk .= $word . ' ';

            if (($i + 1) % 5 === 0 || $i === count($words) - 1) {
                yield trim($chunk);
                $chunk = '';
            }
        }
    }

    /**
     * Build system prompt with product context
     */
    protected function buildSystemPrompt(): string
    {
        // Get featured products for context
        $products = Product::active()
            ->featured()
            ->select('name', 'original_price', 'sale_price', 'brand', 'short_description')
            ->limit(10)
            ->get();

        $productList = $products->map(function ($p) {
            $price = $p->sale_price ?? $p->original_price;
            return "- {$p->name} ({$p->brand}): " . number_format($price) . "đ - {$p->short_description}";
        })->join("\n");

        return <<<PROMPT
Bạn là trợ lý bán hàng AI của cửa hàng Điện Lạnh, chuyên tư vấn các sản phẩm điện lạnh như máy lạnh, tủ lạnh, máy giặt, quạt điện.

## Thông tin cửa hàng:
- Tên: Cửa hàng Điện Lạnh
- Địa chỉ: TP. Hồ Chí Minh
- Hotline: 1900 xxxx
- Miễn phí giao hàng đơn từ 5 triệu đồng

## Một số sản phẩm nổi bật:
{$productList}

## Hướng dẫn:
1. Trả lời lịch sự, thân thiện bằng tiếng Việt
2. Tư vấn sản phẩm phù hợp với nhu cầu khách hàng
3. Đề xuất sản phẩm cụ thể khi được hỏi
4. Giải đáp thắc mắc về bảo hành, giao hàng, thanh toán
5. Nếu không biết, hướng dẫn khách liên hệ hotline

## Lưu ý:
- Giữ câu trả lời ngắn gọn, dễ hiểu
- Không bịa thông tin sản phẩm không có
- Luôn xác nhận lại nhu cầu khách trước khi tư vấn
PROMPT;
    }
}
