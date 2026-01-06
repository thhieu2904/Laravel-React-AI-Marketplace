<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class UnifiedAuthController extends Controller
{
    /**
     * Universal login - checks both admin and customer tables
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

        // First, try to find in admins table
        $admin = Admin::where('email', $request->email)->first();
        
        if ($admin) {
            if (!Hash::check($request->password, $admin->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email hoặc mật khẩu không đúng',
                ], 401);
            }

            if (!$admin->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tài khoản đã bị khóa',
                ], 403);
            }

            // Generate token with admin guard
            $token = JWTAuth::fromUser($admin);

            return response()->json([
                'success' => true,
                'message' => 'Đăng nhập thành công',
                'data' => [
                    'user' => $admin,
                    'user_type' => 'admin',
                    'token' => $token,
                    'token_type' => 'bearer',
                    'expires_in' => config('jwt.ttl') * 60,
                ],
            ]);
        }

        // If not admin, try customer table
        $customer = Customer::where('email', $request->email)->first();

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Email hoặc mật khẩu không đúng',
            ], 401);
        }

        if (!Hash::check($request->password, $customer->password)) {
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

        // Generate token with customer guard
        $token = JWTAuth::fromUser($customer);

        return response()->json([
            'success' => true,
            'message' => 'Đăng nhập thành công',
            'data' => [
                'user' => $customer,
                'user_type' => 'customer',
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => config('jwt.ttl') * 60,
            ],
        ]);
    }
}
