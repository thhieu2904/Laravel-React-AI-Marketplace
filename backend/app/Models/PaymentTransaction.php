<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentTransaction extends Model
{
    use HasFactory;

    protected $table = 'payment_transactions';

    protected $fillable = [
        'order_id',
        'request_id',
        'transaction_id',
        'provider',
        'amount',
        'status',
        'signature_valid',
        'provider_response',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:0',
            'signature_valid' => 'boolean',
            'provider_response' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    // Generate unique request ID
    public static function generateRequestId(string $orderCode): string
    {
        return 'REQ_' . $orderCode . '_' . time();
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeSuccess($query)
    {
        return $query->where('status', 'success');
    }

    // Check if can be processed
    public function canBeProcessed(): bool
    {
        return $this->status === 'pending';
    }
}
