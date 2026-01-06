<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Customer;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

// Reset customer password
$customer = Customer::where('email', 'customer1@gmail.com')->first();
if ($customer) {
    $customer->password = Hash::make('password123');
    $customer->save();
    echo "✓ Customer password updated successfully\n";
    echo "  Email: customer1@gmail.com\n";
    echo "  Password: password123\n";
    echo "  Verification: " . (Hash::check('password123', $customer->password) ? 'VALID ✓' : 'INVALID ✗') . "\n\n";
} else {
    echo "✗ Customer not found\n\n";
}

// Reset admin password
$admin = Admin::where('email', 'admin@dienlanh.com')->first();
if ($admin) {
    $admin->password = Hash::make('admin123');
    $admin->save();
    echo "✓ Admin password updated successfully\n";
    echo "  Email: admin@dienlanh.com\n";
    echo "  Password: admin123\n";
    echo "  Verification: " . (Hash::check('admin123', $admin->password) ? 'VALID ✓' : 'INVALID ✗') . "\n";
} else {
    echo "✗ Admin not found\n";
}
