<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['images', 'variants'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'products' => ProductResource::collection($products),
        ]);
    }

    public function show(string $id)
    {
        $product = Product::with(['images', 'variants'])->find($id);

        if (! $product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json([
            'product' => new ProductResource($product),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string'],
            'description' => ['required', 'string'],
            'basePrice' => ['required', 'numeric'],
            'brand' => ['required', 'string'],
            'category' => ['required', 'string'],
            'images' => ['nullable', 'array'],
            'images.*.imageUrl' => ['required_with:images', 'string'],
            'variants' => ['nullable', 'array'],
            'variants.*.size' => ['required_with:variants', 'string'],
            'variants.*.color' => ['required_with:variants', 'string'],
            'variants.*.stock' => ['required_with:variants', 'integer', 'min:0'],
        ]);

        $product = Product::create([
            'name' => $data['name'],
            'description' => $data['description'],
            'base_price' => $data['basePrice'],
            'brand' => $data['brand'],
            'category' => $data['category'],
        ]);

        foreach ($data['images'] ?? [] as $image) {
            $product->images()->create(['image_url' => $image['imageUrl']]);
        }

        foreach ($data['variants'] ?? [] as $variant) {
            $product->variants()->create([
                'size' => $variant['size'],
                'color' => $variant['color'],
                'stock' => $variant['stock'],
            ]);
        }

        $product->load(['images', 'variants']);

        return response()->json([
            'product' => new ProductResource($product),
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        $product = Product::find($id);

        if (! $product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $data = $request->validate([
            'name' => ['sometimes', 'string'],
            'description' => ['sometimes', 'string'],
            'basePrice' => ['sometimes', 'numeric'],
            'brand' => ['sometimes', 'string'],
            'category' => ['sometimes', 'string'],
        ]);

        $product->update([
            'name' => $data['name'] ?? $product->name,
            'description' => $data['description'] ?? $product->description,
            'base_price' => $data['basePrice'] ?? $product->base_price,
            'brand' => $data['brand'] ?? $product->brand,
            'category' => $data['category'] ?? $product->category,
        ]);

        $product->load(['images', 'variants']);

        return response()->json([
            'product' => new ProductResource($product),
        ]);
    }

    public function destroy(string $id)
    {
        $product = Product::find($id);

        if (! $product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->delete();

        return response()->noContent();
    }
}
