<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('slug', 255)->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('brand', 100)->nullable();
            $table->string('model', 100)->nullable();
            $table->json('specifications')->nullable();
            $table->integer('stock_quantity')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->unsignedBigInteger('category_id');
            $table->unsignedBigInteger('admin_id');
            $table->timestamps();

            $table->foreign('category_id')->references('id')->on('categories');
            $table->foreign('admin_id')->references('id')->on('admins');
            $table->index(['category_id', 'is_active']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
