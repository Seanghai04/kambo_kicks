<?php

use App\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'KAMBO-KICKS Laravel API',
        'docs' => '/api/health',
    ]);
});

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

/*
| Client Success Redirect URL (payment gateway → browser)
| Full path: GET /checkout/success?tran_id=... or ?order_id=...
*/
Route::get('/checkout/success', [PaymentController::class, 'paymentSuccess'])
    ->name('checkout.success');
