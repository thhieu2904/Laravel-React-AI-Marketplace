<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AdminAuthController extends Controller
{
    /**
     * Login admin
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

        // Find admin by email
        $admin = Admin::where('email', $request->email)->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
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

        // Generate token
        $token = JWTAuth::fromUser($admin);

        return response()->json([
            'success' => true,
            'message' => 'Đăng nhập thành công',
            'data' => [
                'admin' => $admin,
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => config('jwt.ttl') * 60,
            ],
        ]);
    }

    /**
     * Get authenticated admin profile
     */
    public function me(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => auth('admin')->user(),
        ]);
    }

    /**
     * Logout admin (invalidate token)
     */
    public function logout(): JsonResponse
    {
        auth('admin')->logout();

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
        $token = auth('admin')->refresh();

        return response()->json([
            'success' => true,
            'data' => [
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => config('jwt.ttl') * 60,
            ],
        ]);
    }
}
