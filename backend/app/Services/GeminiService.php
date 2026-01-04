<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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
     * Generate chat response with Smart Context RAG
     */
    public function chat(string $userMessage, array $conversationHistory = []): string
    {
        // Stage 1: Analyze user intent
        $intent = $this->analyzeIntent($userMessage);
        
        // Stage 2: Get relevant products based on intent
        $products = $this->getRelevantProducts($intent);
        
        // Stage 3: Build context-aware prompt and generate response
        $systemPrompt = $this->buildSystemPrompt($products, $intent);

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
            Log::error('Gemini API error', ['response' => $response->body()]);
            throw new \Exception('Gemini API error: ' . $response->body());
        }

        $data = $response->json();

        return $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Xin lỗi, tôi không thể trả lời lúc này.';
    }

    /**
     * Stage 1: Analyze user intent using LLM
     */
    protected function analyzeIntent(string $userMessage): array
    {
        // Get all categories for context
        $categories = Category::active()->get(['id', 'name', 'slug'])->toArray();
        $categoryList = collect($categories)->pluck('slug')->join(', ');

        $prompt = <<<PROMPT
Phân tích tin nhắn của khách hàng và trả về JSON với format sau:
{
    "intent": "product_inquiry|contact_info|policy_info|general_chat|order_help",
    "category_slug": "slug của category nếu hỏi về sản phẩm, null nếu không",
    "keywords": ["từ khóa tìm kiếm sản phẩm"],
    "price_max": số tiền tối đa nếu khách đề cập, null nếu không,
    "brand": "thương hiệu nếu khách đề cập, null nếu không"
}

Danh sách category có sẵn: {$categoryList}

Tin nhắn khách hàng: "{$userMessage}"

CHỈ trả về JSON, không giải thích gì thêm.
PROMPT;

        try {
            $response = Http::timeout(15)->post(
                "{$this->baseUrl}/{$this->model}:generateContent?key={$this->apiKey}",
                [
                    'contents' => [
                        ['role' => 'user', 'parts' => [['text' => $prompt]]]
                    ],
                    'generationConfig' => [
                        'temperature' => 0.1, // Low temperature for consistent JSON
                        'maxOutputTokens' => 256,
                    ],
                ]
            );

            if ($response->successful()) {
                $text = $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? '';
                // Extract JSON from response
                $text = preg_replace('/```json\s*|\s*```/', '', $text);
                $intent = json_decode(trim($text), true);
                
                if ($intent) {
                    Log::info('Intent analyzed', ['intent' => $intent]);
                    return $intent;
                }
            }
        } catch (\Exception $e) {
            Log::warning('Intent analysis failed', ['error' => $e->getMessage()]);
        }

        // Default fallback
        return [
            'intent' => 'general_chat',
            'category_slug' => null,
            'keywords' => [],
            'price_max' => null,
            'brand' => null,
        ];
    }

    /**
     * Stage 2: Get relevant products based on intent
     */
    protected function getRelevantProducts(array $intent): array
    {
        // For small dataset, load more products for better recommendations
        // If not product inquiry, return all active products (limited)
        if ($intent['intent'] !== 'product_inquiry' && empty($intent['category_slug'])) {
            return Product::active()
                ->with('category:id,name,slug')
                ->orderBy('is_featured', 'desc')
                ->limit(30)
                ->get()
                ->toArray();
        }

        $query = Product::active()->with('category:id,name,slug');

        // Filter by category
        if (!empty($intent['category_slug'])) {
            $category = Category::where('slug', $intent['category_slug'])->first();
            if ($category) {
                // Include children categories
                $categoryIds = [$category->id];
                $childIds = Category::where('parent_id', $category->id)->pluck('id')->toArray();
                $categoryIds = array_merge($categoryIds, $childIds);
                
                $query->whereIn('category_id', $categoryIds);
            }
        }

        // Filter by price
        if (!empty($intent['price_max'])) {
            $query->where(function($q) use ($intent) {
                $q->where('sale_price', '<=', $intent['price_max'])
                  ->orWhere(function($q2) use ($intent) {
                      $q2->whereNull('sale_price')
                         ->where('original_price', '<=', $intent['price_max']);
                  });
            });
        }

        // Filter by brand
        if (!empty($intent['brand'])) {
            $query->where('brand', 'like', '%' . $intent['brand'] . '%');
        }

        // Search by keywords
        if (!empty($intent['keywords'])) {
            $query->where(function($q) use ($intent) {
                foreach ($intent['keywords'] as $keyword) {
                    $q->orWhere('name', 'like', '%' . $keyword . '%')
                      ->orWhere('short_description', 'like', '%' . $keyword . '%');
                }
            });
        }

        return $query->limit(20)->get()->toArray();
    }

    /**
     * Stage 3: Build system prompt with context
     */
    protected function buildSystemPrompt(array $products, array $intent): string
    {
        $store = config('store');
        
        // Format products with full details
        $productList = '';
        if (!empty($products)) {
            foreach ($products as $i => $p) {
                $price = $p['sale_price'] ?? $p['original_price'];
                $originalPrice = $p['original_price'];
                $discount = $p['sale_price'] ? ' (giảm ' . round((1 - $p['sale_price'] / $originalPrice) * 100) . '%)' : '';
                $category = $p['category']['name'] ?? 'Khác';
                
                $productList .= ($i + 1) . ". {$p['name']} ({$p['brand']})\n";
                $productList .= "   Giá: " . number_format($price) . "đ{$discount}\n";
                $productList .= "   Danh mục: {$category}\n";
                $productList .= "   Mô tả ngắn: {$p['short_description']}\n";
                
                // Add specifications if available
                if (!empty($p['specifications']) && is_array($p['specifications'])) {
                    $specs = [];
                    foreach ($p['specifications'] as $key => $value) {
                        $specs[] = "{$key}: {$value}";
                    }
                    $productList .= "   Thông số: " . implode(', ', $specs) . "\n";
                }
                
                // Add detailed description (truncated)
                if (!empty($p['description'])) {
                    $desc = strip_tags($p['description']);
                    $desc = mb_substr($desc, 0, 2000);
                    $productList .= "   Chi tiết: {$desc}\n";
                }
                
                $productList .= "\n";
            }
        }

        // Get all categories
        $categories = Category::active()->root()->with('children')->get();
        $categoryList = $categories->map(function($c) {
            $children = $c->children->pluck('name')->join(', ');
            return "- {$c->name}" . ($children ? " (gồm: {$children})" : '');
        })->join("\n");

        $intentDescription = match($intent['intent']) {
            'product_inquiry' => 'Khách đang hỏi về sản phẩm',
            'contact_info' => 'Khách đang hỏi thông tin liên hệ',
            'policy_info' => 'Khách đang hỏi về chính sách',
            'order_help' => 'Khách cần hỗ trợ đơn hàng',
            default => 'Trò chuyện thông thường',
        };

        return <<<PROMPT
Bạn là trợ lý bán hàng AI của cửa hàng **{$store['name']}**, chuyên tư vấn sản phẩm điện lạnh.

## THÔNG TIN CỬA HÀNG:
- **Địa chỉ**: {$store['contact']['address']}
- **Điện thoại**: {$store['contact']['phone']}
- **Email**: {$store['contact']['email']}
- **Giờ làm việc**: {$store['contact']['working_hours']}

## CHÍNH SÁCH:
- **Bảo hành**: {$store['policies']['warranty']}
- **Giao hàng**: {$store['policies']['delivery']}
- **Thanh toán**: {$store['policies']['payment']}
- **Đổi trả**: {$store['policies']['return']}

## DANH MỤC SẢN PHẨM:
{$categoryList}

## SẢN PHẨM PHÙ HỢP (dựa trên câu hỏi):
{$productList}

## PHÂN TÍCH Ý ĐỊNH KHÁCH HÀNG:
{$intentDescription}

## HƯỚNG DẪN TRẢ LỜI:
1. Trả lời lịch sự, thân thiện bằng tiếng Việt
2. Tư vấn sản phẩm CỤ THỂ từ danh sách trên, dùng thông số từ mục "Chi tiết" và "Thông số"
3. Đề cập giá, ưu điểm khi giới thiệu sản phẩm
4. Nếu không có sản phẩm phù hợp, đề xuất danh mục khác hoặc liên hệ hotline
5. Giữ câu trả lời ngắn gọn, dễ hiểu
6. Nếu hỏi về liên hệ/chính sách, trả lời từ thông tin cửa hàng ở trên

## ĐỊNH DẠNG TRẢ LỜI:
- Dùng dấu xuống dòng để dễ đọc
- Khi liệt kê sản phẩm: dùng số thứ tự (1. 2. 3.)
- Khi nói về tính năng: dùng dấu gạch đầu dòng (-)
- KHÔNG dùng markdown quá phức tạp như ** hoặc ##

## LƯU Ý QUAN TRỌNG:
- TUYỆT ĐỐI KHÔNG bịa tên sản phẩm, giá, thông số KHÔNG có trong danh sách trên
- CHỈ giới thiệu sản phẩm CÓ TRONG DANH SÁCH "SẢN PHẨM PHÙ HỢP" ở trên
- Nếu danh sách trống hoặc không có sản phẩm phù hợp, nói "Hiện tại cửa hàng chưa có sản phẩm phù hợp" và mời khách liên hệ hotline
- Luôn xác nhận lại nhu cầu khách nếu chưa rõ
- Đánh số sản phẩm để khách dễ hỏi tiếp "cái số 1", "cái thứ 2"
PROMPT;
    }

    /**
     * Generate chat response with SSE streaming
     */
    public function streamChat(string $userMessage, array $conversationHistory = []): \Generator
    {
        // For simplicity, use non-streaming approach and simulate chunks
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
}
