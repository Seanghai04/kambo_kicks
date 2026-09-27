<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\PaymentController;
use App\Http\Middleware\EnsureAdmin;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    try {
        DB::select('select 1');

        return response()->json([
            'status' => 'ok',
            'database' => 'connected',
            'backend' => 'laravel',
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'error',
            'database' => 'disconnected',
            'backend' => 'laravel',
        ], 503);
    }
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/google', [AuthController::class, 'google']);
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
});

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

/*
| Success Webhook Callback URL (payment gateway → backend)
| Full path: POST /api/v1/payments/webhook
*/
Route::prefix('v1/payments')->group(function () {
    Route::post('/webhook', [PaymentController::class, 'handleWebhook']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/products', [ProductController::class, 'store'])->middleware(EnsureAdmin::class);
    Route::put('/products/{id}', [ProductController::class, 'update'])->middleware(EnsureAdmin::class);
    Route::delete('/products/{id}', [ProductController::class, 'destroy'])->middleware(EnsureAdmin::class);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus'])->middleware(EnsureAdmin::class);

    Route::prefix('admin')->middleware(EnsureAdmin::class)->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/orders', [AdminController::class, 'orders']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::patch('/users/{id}', [AdminController::class, 'updateUser']);
        Route::get('/inventory', [AdminController::class, 'inventory']);
        Route::patch('/inventory/{id}', [AdminController::class, 'updateStock']);
        Route::get('/finance', [AdminController::class, 'finance']);
        Route::get('/delivery', [AdminController::class, 'delivery']);
        Route::get('/reports', [AdminController::class, 'reports']);
        Route::get('/notifications', [AdminController::class, 'notifications']);
        Route::get('/loyalty', [AdminController::class, 'loyalty']);
        Route::get('/procurement', [AdminController::class, 'procurement']);
        Route::get('/contacts', [AdminController::class, 'contacts']);
        Route::post('/contacts', [AdminController::class, 'storeContact']);
        Route::patch('/contacts/{id}', [AdminController::class, 'updateContact']);
        Route::get('/messages', [AdminController::class, 'contacts']);
        Route::get('/settings', [AdminController::class, 'settings']);
        Route::put('/settings', [AdminController::class, 'updateSettings']);
        Route::get('/replacements', [AdminController::class, 'replacements']);
        Route::post('/replacements', [AdminController::class, 'storeReplacement']);
        Route::patch('/replacements/{id}', [AdminController::class, 'updateReplacement']);
    });
});
