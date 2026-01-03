<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    use HasFactory;

    protected $table = 'carts';

    protected $fillable = [
        'customer_id',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    // Get total items count
    public function getTotalItemsAttribute(): int
    {
        return $this->items->sum('quantity');
    }

    // Get total price
    public function getTotalPriceAttribute(): float
    {
        return $this->items->sum(function ($item) {
            $price = $item->product->sale_price ?? $item->product->original_price;
            return $price * $item->quantity;
        });
    }
}
