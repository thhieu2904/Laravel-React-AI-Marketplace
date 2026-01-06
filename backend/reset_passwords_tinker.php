<?php

use Illuminate\Support\Facades\Hash;
use App\Models\Customer;
use App\Models\Admin;

// Reset customer password
$customer = Customer::where('email', 'customer1@gmail.com')->first();
if ($customer) {
    $customer->password = Hash::make('password123');
    $customer->save();
    echo "✓ Customer password updated: customer1@gmail.com / password123\n";
} else {
    echo "✗ Customer not found\n";
}

// Reset admin password
$admin = Admin::where('email', 'admin@dienlanh.com')->first();
if ($admin) {
    $admin->password = Hash::make('admin123');
    $admin->save();
    echo "✓ Admin password updated: admin@dienlanh.com / admin123\n";
} else {
    echo "✗ Admin not found\n";
}

// Verify
$customer = Customer::where('email', 'customer1@gmail.com')->first();
echo "\nVerifying customer password: ";
echo Hash::check('password123', $customer->password) ? "VALID ✓\n" : "INVALID ✗\n";

$admin = Admin::where('email', 'admin@dienlanh.com')->first();
echo "Verifying admin password: ";
echo Hash::check('admin123', $admin->password) ? "VALID ✓\n" : "INVALID ✗\n";
