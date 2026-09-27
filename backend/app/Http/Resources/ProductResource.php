<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'basePrice' => (float) $this->base_price,
            'brand' => $this->brand,
            'category' => $this->category,
            'createdAt' => optional($this->created_at)?->toISOString(),
            'images' => $this->whenLoaded('images', function () {
                return $this->images->map(fn ($image) => [
                    'id' => (string) $image->id,
                    'productId' => (string) $image->product_id,
                    'imageUrl' => $image->image_url,
                ]);
            }),
            'variants' => $this->whenLoaded('variants', function () {
                return $this->variants->map(fn ($variant) => [
                    'id' => (string) $variant->id,
                    'productId' => (string) $variant->product_id,
                    'size' => $variant->size,
                    'color' => $variant->color,
                    'stock' => $variant->stock,
                ]);
            }),
        ];
    }
}
