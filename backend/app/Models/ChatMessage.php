<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatMessage extends Model
{
    use HasFactory;

    protected $table = 'chat_messages';

    public $timestamps = false;

    const CREATED_AT = 'created_at';

    protected $fillable = [
        'conversation_id',
        'sender_type',
        'content',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(ChatConversation::class, 'conversation_id');
    }

    public function isFromCustomer(): bool
    {
        return $this->sender_type === 'customer';
    }

    public function isFromBot(): bool
    {
        return $this->sender_type === 'bot';
    }
}
