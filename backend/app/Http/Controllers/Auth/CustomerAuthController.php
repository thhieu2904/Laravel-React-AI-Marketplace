<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class CustomerAuthController extends Controller
{
    /**
     * Register a new customer
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:customers,email',
            'password' => 'required|min:6|confirmed',
            'full_name' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $customer = Customer::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'full_name' => $request->full_name,
            'phone' => $request->phone,
            'address' => $request->address,
            'is_active' => true,
        ]);

        // Generate token for the new customer
        $token = JWTAuth::fromUser($customer);

        return response()->json([
            'success' => true,
            'message' => 'Đăng ký thành công',
            'data' => [
                'customer' => $customer,
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => config('jwt.ttl') * 60,
            ],
        ], 201);
    }

    /**
     * Login customer
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Find customer by email
        $customer = Customer::where('email', $request->email)->first();

        if (!$customer || !Hash::check($request->password, $customer->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email hoặc mật khẩu không đúng',
            ], 401);
        }

        if (!$customer->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản đã bị khóa',
            ], 403);
        }

        // Generate token
        $token = JWTAuth::fromUser($customer);

        return response()->json([
            'success' => true,
            'message' => 'Đăng nhập thành công',
            'data' => [
                'customer' => $customer,
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => config('jwt.ttl') * 60,
            ],
        ]);
    }

    /**
     * Get authenticated customer profile
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => auth('customer')->user(),
        ]);
    }

    /**
     * Logout customer (invalidate token)
     */
    public function logout(): JsonResponse
    {
        auth('customer')->logout();

        return response()->json([
            'success' => true,
            'message' => 'Đăng xuất thành công',
        ]);
    }

    /**
     * Refresh token
     */
    public function refresh(): JsonResponse
    {
        $token = auth('customer')->refresh();

        return response()->json([
            'success' => true,
            'data' => [
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => config('jwt.ttl') * 60,
            ],
        ]);
    }

    /**
     * Change customer password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $customer = auth('customer')->user();

        if (!Hash::check($request->current_password, $customer->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Mật khẩu hiện tại không đúng',
            ], 400);
        }

        $customer->password = Hash::make($request->new_password);
        $customer->save();

        return response()->json([
            'success' => true,
            'message' => 'Đổi mật khẩu thành công',
        ]);
    }

    /**
     * Update customer profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $customer = auth('customer')->user();
        $customer->full_name = $request->full_name;
        $customer->phone = $request->phone;
        $customer->address = $request->address;
        $customer->save();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin thành công',
            'data' => $customer,
        ]);
    }

    /**
     * Request account action (lock/delete)
     * Admin will review and process these requests
     */
    public function requestAccountAction(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'action' => 'required|in:lock,delete',
            'reason' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $customer = auth('customer')->user();
        $action = $request->action;
        $reason = $request->reason ?? 'Không có lý do';

        // Log the request for admin review
        \Log::channel('daily')->info("Account Action Request", [
            'customer_id' => $customer->id,
            'customer_email' => $customer->email,
            'customer_name' => $customer->full_name,
            'action' => $action,
            'reason' => $reason,
            'requested_at' => now()->toDateTimeString(),
        ]);

        $actionText = $action === 'lock' ? 'khóa' : 'xóa';

        return response()->json([
            'success' => true,
            'message' => "Yêu cầu {$actionText} tài khoản đã được gửi. Admin sẽ xem xét và liên hệ bạn qua email.",
        ]);
    }
}
