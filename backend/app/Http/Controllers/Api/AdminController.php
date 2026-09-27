<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\ContactMessage;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ReplacementRequest;
use App\Models\SiteSetting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    public function stats()
    {
        $now = Carbon::now();
        $start30 = $now->copy()->subDays(29)->startOfDay();
        $startMonth = $now->copy()->startOfMonth();
        $startToday = $now->copy()->startOfDay();

        $orders30 = Order::where('created_at', '>=', $start30)->get();

        $byStatus = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $dailyRows = Order::select(
            DB::raw('DATE(created_at) as day'),
            DB::raw('COALESCE(SUM(total), 0) as amount'),
            DB::raw('COUNT(*) as orders')
        )
            ->where('created_at', '>=', $start30)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('day')
            ->get()
            ->keyBy('day');

        $dailyRevenue = [];
        for ($i = 0; $i < 30; $i++) {
            $day = $start30->copy()->addDays($i)->toDateString();
            $row = $dailyRows->get($day);
            $dailyRevenue[] = [
                'date' => $day,
                'amount' => (float) ($row->amount ?? 0),
                'orders' => (int) ($row->orders ?? 0),
            ];
        }

        $recent = Order::with(['user', 'items.productVariant.product'])
            ->orderByDesc('created_at')
            ->limit(8)
            ->get();

        $pending = (int) ($byStatus['PENDING'] ?? 0);
        $paid = (int) ($byStatus['PAID'] ?? 0);
        $shipped = (int) ($byStatus['SHIPPED'] ?? 0);
        $delivered = (int) ($byStatus['DELIVERED'] ?? 0);

        return response()->json([
            'stats' => [
                'users' => User::count(),
                'products' => Product::count(),
                'orders' => Order::count(),
                'orders30d' => $orders30->count(),
                'revenue' => (float) Order::sum('total'),
                'revenue30d' => (float) $orders30->sum('total'),
                'revenueToday' => (float) Order::where('created_at', '>=', $startToday)->sum('total'),
                'revenueMonth' => (float) Order::where('created_at', '>=', $startMonth)->sum('total'),
                'newCustomers30d' => User::where('created_at', '>=', $start30)->count(),
                'pending' => $pending,
                'paid' => $paid,
                'shipped' => $shipped,
                'delivered' => $delivered,
                'ordersByStatus' => [
                    ['status' => 'PENDING', 'label' => 'Pending', 'count' => $pending],
                    ['status' => 'PAID', 'label' => 'Paid', 'count' => $paid],
                    ['status' => 'SHIPPED', 'label' => 'Shipped', 'count' => $shipped],
                    ['status' => 'DELIVERED', 'label' => 'Delivered', 'count' => $delivered],
                ],
                'dailyRevenue' => $dailyRevenue,
                'recentOrders' => OrderResource::collection($recent),
            ],
        ]);
    }

    public function orders()
    {
        $orders = Order::with(['user', 'items.productVariant.product'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'orders' => OrderResource::collection($orders),
        ]);
    }

    public function users()
    {
        $users = User::query()
            ->withCount('orders')
            ->withSum('orders', 'total')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (User $user) => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'ordersCount' => (int) $user->orders_count,
                'spent' => (float) ($user->orders_sum_total ?? 0),
                'createdAt' => optional($user->created_at)?->toISOString(),
            ]);

        return response()->json(['users' => $users]);
    }

    public function updateUser(Request $request, string $id)
    {
        $data = $request->validate([
            'role' => ['required', Rule::in(['USER', 'ADMIN'])],
        ]);

        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id && $data['role'] !== 'ADMIN') {
            return response()->json(['message' => 'You cannot remove your own admin role.'], 422);
        }

        $user->update(['role' => $data['role']]);

        return response()->json([
            'user' => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    public function inventory()
    {
        $threshold = (int) (SiteSetting::map()['low_stock_threshold'] ?? 8);

        $items = ProductVariant::with('product')
            ->orderBy('stock')
            ->get()
            ->map(function (ProductVariant $variant) use ($threshold) {
                $stock = (int) $variant->stock;

                return [
                    'id' => (string) $variant->id,
                    'productId' => (string) $variant->product_id,
                    'productName' => $variant->product?->name,
                    'brand' => $variant->product?->brand,
                    'category' => $variant->product?->category,
                    'size' => $variant->size,
                    'color' => $variant->color,
                    'stock' => $stock,
                    'lowStock' => $stock <= $threshold,
                    'outOfStock' => $stock < 1,
                ];
            });

        return response()->json([
            'threshold' => $threshold,
            'summary' => [
                'variants' => $items->count(),
                'lowStock' => $items->where('lowStock', true)->count(),
                'outOfStock' => $items->where('outOfStock', true)->count(),
                'units' => $items->sum('stock'),
            ],
            'items' => $items->values(),
        ]);
    }

    public function updateStock(Request $request, string $id)
    {
        $data = $request->validate([
            'stock' => ['required', 'integer', 'min:0', 'max:100000'],
        ]);

        $variant = ProductVariant::with('product')->findOrFail($id);
        $variant->update(['stock' => $data['stock']]);

        return response()->json([
            'item' => [
                'id' => (string) $variant->id,
                'productId' => (string) $variant->product_id,
                'productName' => $variant->product?->name,
                'size' => $variant->size,
                'color' => $variant->color,
                'stock' => (int) $variant->stock,
            ],
        ]);
    }

    public function finance()
    {
        $byStatus = Order::select('status', DB::raw('COUNT(*) as orders'), DB::raw('COALESCE(SUM(total), 0) as amount'))
            ->groupBy('status')
            ->get()
            ->map(fn ($row) => [
                'status' => $row->status,
                'orders' => (int) $row->orders,
                'amount' => (float) $row->amount,
            ]);

        $monthly = Order::select(
            DB::raw("TO_CHAR(created_at, 'YYYY-MM') as month"),
            DB::raw('COUNT(*) as orders'),
            DB::raw('COALESCE(SUM(total), 0) as amount')
        )
            ->groupBy(DB::raw("TO_CHAR(created_at, 'YYYY-MM')"))
            ->orderBy('month')
            ->limit(12)
            ->get()
            ->map(fn ($row) => [
                'month' => $row->month,
                'orders' => (int) $row->orders,
                'amount' => (float) $row->amount,
            ]);

        $paidStatuses = ['PAID', 'SHIPPED', 'DELIVERED'];

        return response()->json([
            'finance' => [
                'grossRevenue' => (float) Order::sum('total'),
                'collectedRevenue' => (float) Order::whereIn('status', $paidStatuses)->sum('total'),
                'pendingRevenue' => (float) Order::where('status', 'PENDING')->sum('total'),
                'averageOrderValue' => (float) (Order::avg('total') ?? 0),
                'byStatus' => $byStatus,
                'monthly' => $monthly,
            ],
        ]);
    }

    public function delivery()
    {
        $orders = Order::with(['user', 'items.productVariant.product'])
            ->whereIn('status', ['PAID', 'SHIPPED', 'DELIVERED'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'summary' => [
                'ready' => Order::where('status', 'PAID')->count(),
                'shipped' => Order::where('status', 'SHIPPED')->count(),
                'delivered' => Order::where('status', 'DELIVERED')->count(),
            ],
            'orders' => OrderResource::collection($orders),
        ]);
    }

    public function reports()
    {
        $topProducts = OrderItem::query()
            ->select(
                'product_variant_id',
                DB::raw('SUM(quantity) as units'),
                DB::raw('SUM(quantity * price) as revenue')
            )
            ->groupBy('product_variant_id')
            ->orderByDesc('units')
            ->limit(10)
            ->with('productVariant.product')
            ->get()
            ->map(function ($row) {
                $variant = $row->productVariant;
                $product = $variant?->product;

                return [
                    'variantId' => (string) $row->product_variant_id,
                    'productName' => $product?->name ?? 'Unknown',
                    'size' => $variant?->size,
                    'color' => $variant?->color,
                    'category' => $product?->category,
                    'units' => (int) $row->units,
                    'revenue' => (float) $row->revenue,
                ];
            });

        $byCategory = Product::select('category', DB::raw('COUNT(*) as products'))
            ->groupBy('category')
            ->orderByDesc('products')
            ->get()
            ->map(fn ($row) => [
                'category' => $row->category,
                'products' => (int) $row->products,
            ]);

        return response()->json([
            'reports' => [
                'topProducts' => $topProducts,
                'byCategory' => $byCategory,
                'customers' => User::where('role', 'USER')->count(),
                'admins' => User::where('role', 'ADMIN')->count(),
                'orders' => Order::count(),
                'revenue' => (float) Order::sum('total'),
            ],
        ]);
    }

    public function notifications()
    {
        $threshold = (int) (SiteSetting::map()['low_stock_threshold'] ?? 8);
        $items = [];

        $pending = Order::where('status', 'PENDING')->count();
        if ($pending > 0) {
            $items[] = [
                'id' => 'pending-orders',
                'type' => 'orders',
                'title' => "{$pending} pending order(s)",
                'body' => 'Customers are waiting for payment confirmation or review.',
                'href' => '/admin/orders',
                'level' => 'warn',
            ];
        }

        $ready = Order::where('status', 'PAID')->count();
        if ($ready > 0) {
            $items[] = [
                'id' => 'ready-ship',
                'type' => 'delivery',
                'title' => "{$ready} order(s) ready to ship",
                'body' => 'Paid orders waiting for delivery handoff.',
                'href' => '/admin/delivery',
                'level' => 'info',
            ];
        }

        $low = ProductVariant::with('product')->where('stock', '<=', $threshold)->orderBy('stock')->limit(12)->get();
        foreach ($low as $variant) {
            $items[] = [
                'id' => 'stock-'.$variant->id,
                'type' => 'inventory',
                'title' => ($variant->product?->name ?? 'Product')." · {$variant->size}/{$variant->color}",
                'body' => $variant->stock < 1 ? 'Out of stock' : "Low stock: {$variant->stock} left (threshold {$threshold})",
                'href' => '/admin/inventory',
                'level' => $variant->stock < 1 ? 'danger' : 'warn',
            ];
        }

        $newMessages = ContactMessage::where('status', 'NEW')->count();
        if ($newMessages > 0) {
            $items[] = [
                'id' => 'messages-new',
                'type' => 'messages',
                'title' => "{$newMessages} new contact message(s)",
                'body' => 'Open Contacts / Messages to reply.',
                'href' => '/admin/contacts',
                'level' => 'info',
            ];
        }

        $openReplacements = ReplacementRequest::where('status', 'OPEN')->count();
        if ($openReplacements > 0) {
            $items[] = [
                'id' => 'replacements-open',
                'type' => 'replacements',
                'title' => "{$openReplacements} open replacement request(s)",
                'body' => 'Review and approve or reject customer replacements.',
                'href' => '/admin/replacements',
                'level' => 'warn',
            ];
        }

        return response()->json([
            'count' => count($items),
            'notifications' => $items,
        ]);
    }

    public function loyalty()
    {
        $members = User::where('role', 'USER')
            ->withSum('orders', 'total')
            ->withCount('orders')
            ->orderByDesc('orders_sum_total')
            ->get()
            ->map(function (User $user) {
                $spent = (float) ($user->orders_sum_total ?? 0);
                $points = (int) floor($spent);

                $tier = 'Member';
                if ($spent >= 500) {
                    $tier = 'Gold';
                } elseif ($spent >= 200) {
                    $tier = 'Silver';
                } elseif ($spent >= 50) {
                    $tier = 'Bronze';
                }

                return [
                    'id' => (string) $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'ordersCount' => (int) $user->orders_count,
                    'spent' => $spent,
                    'points' => $points,
                    'tier' => $tier,
                ];
            });

        return response()->json(['members' => $members]);
    }

    public function procurement()
    {
        $threshold = (int) (SiteSetting::map()['low_stock_threshold'] ?? 8);

        $items = ProductVariant::with('product')
            ->where('stock', '<=', $threshold)
            ->orderBy('stock')
            ->get()
            ->map(function (ProductVariant $variant) use ($threshold) {
                $need = max($threshold * 2 - (int) $variant->stock, 0);

                return [
                    'id' => (string) $variant->id,
                    'productName' => $variant->product?->name,
                    'brand' => $variant->product?->brand,
                    'category' => $variant->product?->category,
                    'size' => $variant->size,
                    'color' => $variant->color,
                    'stock' => (int) $variant->stock,
                    'suggestedOrder' => $need,
                ];
            });

        return response()->json([
            'threshold' => $threshold,
            'items' => $items,
        ]);
    }

    public function contacts()
    {
        $messages = ContactMessage::orderByDesc('created_at')->get()->map(fn (ContactMessage $m) => [
            'id' => (string) $m->id,
            'name' => $m->name,
            'email' => $m->email,
            'subject' => $m->subject,
            'body' => $m->body,
            'status' => $m->status,
            'createdAt' => optional($m->created_at)?->toISOString(),
        ]);

        return response()->json(['messages' => $messages]);
    }

    public function storeContact(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'subject' => ['nullable', 'string', 'max:190'],
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $message = ContactMessage::create($data);

        return response()->json([
            'message' => [
                'id' => (string) $message->id,
                'name' => $message->name,
                'email' => $message->email,
                'subject' => $message->subject,
                'body' => $message->body,
                'status' => $message->status,
                'createdAt' => optional($message->created_at)?->toISOString(),
            ],
        ], 201);
    }

    public function updateContact(Request $request, string $id)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['NEW', 'READ', 'REPLIED', 'ARCHIVED'])],
        ]);

        $message = ContactMessage::findOrFail($id);
        $message->update(['status' => $data['status']]);

        return response()->json([
            'message' => [
                'id' => (string) $message->id,
                'status' => $message->status,
            ],
        ]);
    }

    public function settings()
    {
        return response()->json(['settings' => SiteSetting::map()]);
    }

    public function updateSettings(Request $request)
    {
        $data = $request->validate([
            'store_name' => ['nullable', 'string', 'max:120'],
            'store_email' => ['nullable', 'email', 'max:190'],
            'store_phone' => ['nullable', 'string', 'max:60'],
            'store_address' => ['nullable', 'string', 'max:255'],
            'currency' => ['nullable', 'string', 'max:10'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'shipping_note' => ['nullable', 'string', 'max:500'],
        ]);

        $payload = [];
        foreach ($data as $key => $value) {
            if ($value !== null) {
                $payload[$key] = $value;
            }
        }

        return response()->json([
            'settings' => SiteSetting::putMany($payload),
        ]);
    }

    public function replacements()
    {
        $items = ReplacementRequest::with(['order.user', 'user'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (ReplacementRequest $r) => [
                'id' => (string) $r->id,
                'orderId' => (string) $r->order_id,
                'reason' => $r->reason,
                'status' => $r->status,
                'adminNote' => $r->admin_note,
                'createdAt' => optional($r->created_at)?->toISOString(),
                'user' => $r->user ? [
                    'id' => (string) $r->user->id,
                    'name' => $r->user->name,
                    'email' => $r->user->email,
                ] : ($r->order?->user ? [
                    'id' => (string) $r->order->user->id,
                    'name' => $r->order->user->name,
                    'email' => $r->order->user->email,
                ] : null),
                'orderTotal' => (float) ($r->order?->total ?? 0),
            ]);

        return response()->json(['replacements' => $items]);
    }

    public function storeReplacement(Request $request)
    {
        $data = $request->validate([
            'orderId' => ['required', 'exists:orders,id'],
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $order = Order::findOrFail($data['orderId']);

        $item = ReplacementRequest::create([
            'order_id' => $order->id,
            'user_id' => $order->user_id,
            'reason' => $data['reason'],
            'status' => 'OPEN',
        ]);

        return response()->json(['id' => (string) $item->id], 201);
    }

    public function updateReplacement(Request $request, string $id)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['OPEN', 'APPROVED', 'REJECTED', 'DONE'])],
            'adminNote' => ['nullable', 'string', 'max:1000'],
        ]);

        $item = ReplacementRequest::findOrFail($id);
        $item->update([
            'status' => $data['status'],
            'admin_note' => $data['adminNote'] ?? $item->admin_note,
        ]);

        return response()->json([
            'replacement' => [
                'id' => (string) $item->id,
                'status' => $item->status,
                'adminNote' => $item->admin_note,
            ],
        ]);
    }
}
