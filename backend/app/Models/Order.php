<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';

    protected $fillable = [
        'customer_id',
        'order_code',
        'subtotal',
        'shipping_fee',
        'total_amount',
        'status',
        'payment_method',
        'payment_status',
        'shipping_name',
        'shipping_phone',
        'shipping_address',
        'note',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:0',
            'shipping_fee' => 'decimal:0',
            'total_amount' => 'decimal:0',
            'paid_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    // Relationships
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function paymentTransaction(): HasOne
    {
        return $this->hasOne(PaymentTransaction::class);
    }

    // Scopes
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

    // Generate unique order code
    public static function generateOrderCode(): string
    {
        $date = now()->format('Ymd');
        $lastOrder = self::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastOrder ? (int) substr($lastOrder->order_code, -3) + 1 : 1;

        return 'ORD' . $date . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }

    // Check if can be cancelled
    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'confirmed']);
    }
}
