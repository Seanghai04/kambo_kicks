<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'userId' => (string) $this->user_id,
            'transactionId' => $this->transaction_id,
            'customerName' => $this->customer_name,
            'phone' => $this->phone,
            'total' => (float) $this->total,
            'status' => $this->status,
            'address' => $this->address,
            'shippingMethod' => $this->shipping_method,
            'paymentMethod' => $this->payment_method,
            'shippingFee' => (float) ($this->shipping_fee ?? 0),
            'note' => $this->note,
            'paidAt' => optional($this->paid_at)?->toISOString(),
            'createdAt' => optional($this->created_at)?->toISOString(),
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => (string) $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),
            'items' => $this->whenLoaded('items', function () {
                return $this->items->map(function ($item) {
                    $variant = $item->productVariant;
                    $product = $variant?->product;

                    return [
                        'id' => (string) $item->id,
                        'orderId' => (string) $item->order_id,
                        'productVariantId' => (string) $item->product_variant_id,
                        'quantity' => $item->quantity,
                        'price' => (float) $item->price,
                        'productVariant' => $variant ? [
                            'id' => (string) $variant->id,
                            'productId' => (string) $variant->product_id,
                            'size' => $variant->size,
                            'color' => $variant->color,
                            'stock' => $variant->stock,
                            'product' => $product ? [
                                'id' => (string) $product->id,
                                'name' => $product->name,
                                'description' => $product->description,
                                'basePrice' => (float) $product->base_price,
                                'brand' => $product->brand,
                                'category' => $product->category,
                            ] : null,
                        ] : null,
                    ];
                });
            }),
        ];
    }
}
