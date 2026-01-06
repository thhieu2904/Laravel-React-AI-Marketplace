<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Services
    |--------------------------------------------------------------------------
    */
    'payment' => [
        'provider' => env('PAYMENT_PROVIDER', 'mock'),
        'sepay' => [
            'merchant_id' => env('SEPAY_MERCHANT_ID'),
            'secret_key' => env('SEPAY_SECRET_KEY'),
            'api_url' => env('SEPAY_API_URL', 'https://my.sepay.vn/userapi'),
            'bank_account' => env('SEPAY_BANK_ACCOUNT'),
            'bank_name' => env('SEPAY_BANK_NAME'),
            'account_name' => env('SEPAY_ACCOUNT_NAME', 'DIEN LANH SHOP'),
            'test_amount' => env('SEPAY_TEST_AMOUNT', 0), // 0 = use real amount
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Gemini AI
    |--------------------------------------------------------------------------
    */
    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
    ],

];
