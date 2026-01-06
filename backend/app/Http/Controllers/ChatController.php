<?php

namespace App\Http\Controllers;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Services\GeminiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ChatController extends Controller
{
    protected GeminiService $geminiService;

    public function __construct(GeminiService $geminiService)
    {
        $this->geminiService = $geminiService;
    }

    /**
     * Get or create conversation
     */
    public function getConversation(Request $request): JsonResponse
    {
        $sessionId = $request->get('session_id');
        $customerId = null;

        // Check if customer is logged in
        if ($request->bearerToken()) {
            try {
                $customer = auth('customer')->user();
                $customerId = $customer?->id;
            } catch (\Exception $e) {
                // Not logged in, continue as guest
            }
        }

        // Generate session ID if not provided
        if (!$sessionId) {
            $sessionId = 'sess_' . uniqid();
        }

        // Find or create conversation
        $conversation = ChatConversation::where('session_id', $sessionId)->first();

        if (!$conversation) {
            $conversation = ChatConversation::create([
                'customer_id' => $customerId,
                'session_id' => $sessionId,
                'title' => 'Hội thoại mới',
            ]);
        }

        // Get messages
        $messages = $conversation->messages()->orderBy('created_at', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'conversation_id' => $conversation->id,
                'session_id' => $conversation->session_id,
                'messages' => $messages,
            ],
        ]);
    }

    /**
     * Send message and get AI response
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'session_id' => 'required|string',
            'message' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Find or create conversation
        $conversation = ChatConversation::where('session_id', $request->session_id)->first();

        if (!$conversation) {
            $conversation = ChatConversation::create([
                'session_id' => $request->session_id,
                'title' => mb_substr($request->message, 0, 50),
            ]);
        }

        // Save user message
        $userMessage = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'sender_type' => 'customer',
            'content' => $request->message,
        ]);

        // Get conversation history for context
        $history = $conversation->getRecentMessages(10)->map(function ($m) {
            return [
                'sender_type' => $m->sender_type,
                'content' => $m->content,
            ];
        })->toArray();

        try {
            // Get AI response
            $aiResponse = $this->geminiService->chat($request->message, $history);

            // Save AI response
            $botMessage = ChatMessage::create([
                'conversation_id' => $conversation->id,
                'sender_type' => 'bot',
                'content' => $aiResponse,
            ]);

            // Update conversation title from first message
            if ($conversation->messages()->count() <= 2) {
                $conversation->title = mb_substr($request->message, 0, 50);
                $conversation->save();
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'user_message' => $userMessage,
                    'bot_message' => $botMessage,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Stream AI response using SSE
     */
    public function streamMessage(Request $request): StreamedResponse
    {
        $sessionId = $request->get('session_id');
        $message = $request->get('message');

        if (!$sessionId || !$message) {
            return response()->stream(function () {
                echo "data: " . json_encode(['error' => 'Missing session_id or message']) . "\n\n";
            }, 200, [
                'Content-Type' => 'text/event-stream',
                'Cache-Control' => 'no-cache',
                'Connection' => 'keep-alive',
            ]);
        }

        return response()->stream(function () use ($sessionId, $message) {
            // Find or create conversation
            $conversation = ChatConversation::where('session_id', $sessionId)->first();

            if (!$conversation) {
                $conversation = ChatConversation::create([
                    'session_id' => $sessionId,
                    'title' => mb_substr($message, 0, 50),
                ]);
            }

            // Save user message
            ChatMessage::create([
                'conversation_id' => $conversation->id,
                'sender_type' => 'customer',
                'content' => $message,
            ]);

            // Get history
            $history = $conversation->getRecentMessages(10)->map(function ($m) {
                return [
                    'sender_type' => $m->sender_type,
                    'content' => $m->content,
                ];
            })->toArray();

            // Stream response
            $fullResponse = '';

            try {
                foreach ($this->geminiService->streamChat($message, $history) as $chunk) {
                    $fullResponse .= $chunk . ' ';
                    echo "data: " . json_encode(['chunk' => $chunk, 'done' => false]) . "\n\n";
                    ob_flush();
                    flush();
                    usleep(50000); // 50ms delay for smooth streaming
                }

                // Save full response
                ChatMessage::create([
                    'conversation_id' => $conversation->id,
                    'sender_type' => 'bot',
                    'content' => trim($fullResponse),
                ]);

                echo "data: " . json_encode(['chunk' => '', 'done' => true]) . "\n\n";
            } catch (\Exception $e) {
                echo "data: " . json_encode(['error' => $e->getMessage(), 'done' => true]) . "\n\n";
            }

            ob_flush();
            flush();
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * Get chat history
     */
    public function history(Request $request): JsonResponse
    {
        $customerId = null;

        if ($request->bearerToken()) {
            try {
                $customer = auth('customer')->user();
                $customerId = $customer?->id;
            } catch (\Exception $e) {
                // Not logged in
            }
        }

        if (!$customerId) {
            return response()->json([
                'success' => false,
                'message' => 'Cần đăng nhập để xem lịch sử',
            ], 401);
        }

        $conversations = ChatConversation::where('customer_id', $customerId)
            ->orderBy('updated_at', 'desc')
            ->get(['id', 'session_id', 'title', 'created_at', 'updated_at']);

        return response()->json([
            'success' => true,
            'data' => $conversations,
        ]);
    }
}
