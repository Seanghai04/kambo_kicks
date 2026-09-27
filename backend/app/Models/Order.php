<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'transaction_id',
        'customer_name',
        'phone',
        'total',
        'status',
        'address',
        'shipping_method',
        'payment_method',
        'shipping_fee',
        'note',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'total' => 'decimal:2',
            'shipping_fee' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    /**
     * Whether the order is still awaiting payment confirmation.
     */
    public function isPending(): bool
    {
        return strcasecmp((string) $this->status, 'PENDING') === 0
            || strcasecmp((string) $this->status, 'pending') === 0;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
