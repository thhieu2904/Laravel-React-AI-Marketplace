<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $table = 'categories';

    protected $fillable = [
        'parent_id',
        'name',
        'slug',
        'description',
        'image',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    // Self-referencing relationship for subcategories
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    // Recursive children (all levels)
    public function allChildren(): HasMany
    {
        return $this->children()->with('allChildren');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    // Scope for active categories
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope for root categories (no parent)
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }
}
