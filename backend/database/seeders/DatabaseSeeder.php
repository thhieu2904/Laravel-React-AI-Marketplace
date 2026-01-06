<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Customer;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Lấy admin đầu tiên (đã tạo sẵn)
        $admin = Admin::first();
        if (!$admin) {
            $admin = Admin::create([
                'username' => 'admin',
                'email' => 'admin@dienlanh.com',
                'password' => Hash::make('admin123'),
                'full_name' => 'Administrator',
                'is_active' => true,
            ]);
        }

        // Lấy customer đầu tiên hoặc tạo mới
        $customer = Customer::first();
        if (!$customer) {
            $customer = Customer::create([
                'email' => 'customer@example.com',
                'password' => Hash::make('password123'),
                'full_name' => 'Nguyễn Văn A',
                'phone' => '0901234567',
                'address' => '123 Đường ABC, Quận 1, TP.HCM',
                'is_active' => true,
            ]);
        }

        // Tạo danh mục mẫu
        $category1 = Category::firstOrCreate([
            'slug' => 'may-lanh'
        ], [
            'name' => 'Máy lạnh',
            'description' => 'Các loại máy lạnh dân dụng và công nghiệp',
            'admin_id' => $admin->id,
            'is_active' => true,
        ]);

        $category2 = Category::firstOrCreate([
            'slug' => 'tu-lanh'
        ], [
            'name' => 'Tủ lạnh',
            'description' => 'Tủ lạnh, tủ đông các loại',
            'admin_id' => $admin->id,
            'is_active' => true,
        ]);

        // Tạo sản phẩm mẫu
        Product::firstOrCreate([
            'slug' => 'may-lanh-daikin-1-5hp'
        ], [
            'category_id' => $category1->id,
            'admin_id' => $admin->id,
            'name' => 'Máy lạnh Daikin 1.5HP',
            'description' => 'Máy lạnh Daikin inverter tiết kiệm điện với công nghệ tiên tiến',
            'price' => 11000000,
            'stock_quantity' => 10,
            'brand' => 'Daikin',
            'is_featured' => true,
            'is_active' => true,
        ]);

        Product::firstOrCreate([
            'slug' => 'tu-lanh-samsung-300l'
        ], [
            'category_id' => $category2->id,
            'admin_id' => $admin->id,
            'name' => 'Tủ lạnh Samsung 300L',
            'description' => 'Tủ lạnh Samsung Side by Side với công nghệ làm lạnh tiên tiến',
            'price' => 14000000,
            'stock_quantity' => 5,
            'brand' => 'Samsung',
            'is_featured' => true,
            'is_active' => true,
        ]);
    }
}
