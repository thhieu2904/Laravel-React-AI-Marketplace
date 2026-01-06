<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
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
        // LOG REQUEST FOR DEBUGGING
        Log::info('Customer login attempt', [
            'email' => $request->email,
            'password_length' => strlen($request->password ?? ''),
            'ip' => $request->ip(),
        ]);

        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            Log::warning('Validation failed', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Find customer by email
        $customer = Customer::where('email', $request->email)->first();

        if (!$customer) {
            Log::warning('Customer not found', ['email' => $request->email]);
            return response()->json([
                'success' => false,
                'message' => 'Email hoặc mật khẩu không đúng',
            ], 401);
        }

        if (!Hash::check($request->password, $customer->password)) {
            Log::warning('Password mismatch', [
                'email' => $request->email,
                'hash_starts_with' => substr($customer->password, 0, 20),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Email hoặc mật khẩu không đúng',
            ], 401);
        }

        if (!$customer->is_active) {
            Log::warning('Inactive account', ['email' => $request->email]);
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản đã bị khóa',
            ], 403);
        }

        // Generate token
        $token = JWTAuth::fromUser($customer);

        Log::info('Login successful', ['email' => $request->email]);

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
     * Update customer profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $customer = auth('customer')->user();

        $validator = Validator::make($request->all(), [
            'full_name' => 'sometimes|required|string|max:100',
            'phone' => 'sometimes|required|string|max:20',
            'address' => 'sometimes|required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $customer->update($request->only(['full_name', 'phone', 'address']));

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin thành công',
            'data' => $customer->fresh(),
        ]);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $customer = auth('customer')->user();

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

        if (! Hash::check($request->current_password, $customer->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Mật khẩu hiện tại không đúng',
            ], 400);
        }

        $customer->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đổi mật khẩu thành công',
        ]);
    }

    /**
     * Request account action (deactivate/delete)
     */
    public function requestAccountAction(Request $request): JsonResponse
    {
        $customer = auth('customer')->user();

        $validator = Validator::make($request->all(), [
            'action' => 'required|in:deactivate,delete',
            'reason' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // In a real application, you might want to queue this action
        // or send it for admin approval
        if ($request->action === 'deactivate') {
            $customer->update(['is_active' => false]);
            auth('customer')->logout();

            return response()->json([
                'success' => true,
                'message' => 'Tài khoản đã được vô hiệu hóa',
            ]);
        }

        // For delete action, you might want to soft delete or queue it
        return response()->json([
            'success' => true,
            'message' => 'Yêu cầu xóa tài khoản đã được ghi nhận',
        ]);
    }
}
