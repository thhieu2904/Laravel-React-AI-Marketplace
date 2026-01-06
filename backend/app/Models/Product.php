<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'short_description',
        'description',
        'original_price',
        'sale_price',
        'stock_quantity',
        'brand',
        'specifications',
        'is_featured',
        'is_active',
        'view_count',
    ];

    protected function casts(): array
    {
        return [
            'original_price' => 'decimal:0',
            'sale_price' => 'decimal:0',
            'stock_quantity' => 'integer',
            'specifications' => 'array',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'view_count' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    // Relationships
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function primaryImage(): HasMany
    {
        return $this->hasMany(ProductImage::class)->where('is_primary', true);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('stock_quantity', '>', 0);
    }

    // Accessors
    public function getCurrentPriceAttribute(): float
    {
        return $this->sale_price ?? $this->original_price;
    }

    public function getDiscountPercentAttribute(): ?int
    {
        if ($this->sale_price && $this->original_price > 0) {
            return (int) round((1 - $this->sale_price / $this->original_price) * 100);
        }
        return null;
    }

    public function getAverageRatingAttribute(): ?float
    {
        $avg = $this->reviews()->where('is_approved', true)->avg('rating');
        return $avg ? round($avg, 1) : null;
    }
}
