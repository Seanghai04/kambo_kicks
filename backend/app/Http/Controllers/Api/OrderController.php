<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::with(['items.productVariant.product'])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'orders' => OrderResource::collection($orders),
        ]);
    }

    public function show(Request $request, string $id)
    {
        $query = Order::with(['items.productVariant.product']);

        if (! $request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }

        $order = $query->find($id);

        if (! $order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        if ($request->user()->isAdmin()) {
            $order->load('user');
        }

        return response()->json([
            'order' => new OrderResource($order),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'fullName' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:40'],
            'address' => ['required', 'string', 'max:1000'],
            'city' => ['nullable', 'string', 'max:120'],
            'note' => ['nullable', 'string', 'max:1000'],
            'shippingMethod' => ['required', 'in:standard,express'],
            'paymentMethod' => ['required', 'in:cod,aba'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.productVariantId' => ['required'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $variantIds = collect($data['items'])->pluck('productVariantId');
        $variants = ProductVariant::with('product')
            ->whereIn('id', $variantIds)
            ->get()
            ->keyBy('id');

        if ($variants->count() !== $variantIds->unique()->count()) {
            return response()->json(['message' => 'One or more variants not found'], 400);
        }

        foreach ($data['items'] as $item) {
            $variant = $variants[$item['productVariantId']];
            if ($variant->stock < $item['quantity']) {
                return response()->json([
                    'message' => "Not enough stock for {$variant->product->name}",
                ], 400);
            }
        }

        $order = DB::transaction(function () use ($data, $variants, $request) {
            $orderItems = [];
            $subtotal = 0;

            foreach ($data['items'] as $item) {
                $variant = $variants[$item['productVariantId']];
                $price = $variant->product->base_price;
                $subtotal += ((float) $price) * $item['quantity'];

                $variant->decrement('stock', $item['quantity']);

                $orderItems[] = [
                    'product_variant_id' => $variant->id,
                    'quantity' => $item['quantity'],
                    'price' => $price,
                ];
            }

            $shippingFee = $this->calculateShippingFee($data['shippingMethod'], $subtotal);
            $street = trim($data['address']);
            if (! empty($data['city'])) {
                $street .= ', '.trim($data['city']);
            }

            $order = Order::create([
                'user_id' => $request->user()->id,
                'transaction_id' => 'KK-'.strtoupper(uniqid()).'-'.$request->user()->id,
                'customer_name' => trim($data['fullName']),
                'phone' => trim($data['phone']),
                'address' => $street,
                'shipping_method' => $data['shippingMethod'],
                'payment_method' => $data['paymentMethod'],
                'shipping_fee' => $shippingFee,
                'note' => isset($data['note']) ? trim((string) $data['note']) : null,
                'total' => $subtotal + $shippingFee,
                // COD and ABA both start pending; ABA webhook marks PAID later.
                'status' => 'PENDING',
            ]);

            $order->items()->createMany($orderItems);

            return $order->load(['items.productVariant.product']);
        });

        return response()->json([
            'order' => new OrderResource($order),
        ], 201);
    }

    public function updateStatus(Request $request, string $id)
    {
        $data = $request->validate([
            'status' => ['required', 'in:PENDING,PAID,SHIPPED,DELIVERED'],
        ]);

        $order = Order::find($id);

        if (! $order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $order->update(['status' => $data['status']]);

        return response()->json([
            'order' => new OrderResource($order),
        ]);
    }

    /**
     * Standard: $2 (free at $100+). Express: $5.
     */
    protected function calculateShippingFee(string $method, float $subtotal): float
    {
        if ($method === 'express') {
            return 5.00;
        }

        return $subtotal >= 100 ? 0.00 : 2.00;
    }
}
