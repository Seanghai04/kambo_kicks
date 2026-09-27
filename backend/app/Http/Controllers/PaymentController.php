<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\View\View;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class PaymentController extends Controller
{
    /**
     * Handle the payment gateway Success Webhook Callback.
     *
     * Expects JSON or form fields: tran_id, status, amount, hash.
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'tran_id' => ['required', 'string', 'max:191'],
                'status' => ['required'],
                'amount' => ['required', 'numeric'],
                'hash' => ['required', 'string'],
            ]);
        } catch (Throwable $e) {
            Log::error('Payment webhook validation failed', [
                'errors' => method_exists($e, 'errors') ? $e->errors() : $e->getMessage(),
                'payload' => $request->except(['hash']),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Invalid webhook payload',
            ], Response::HTTP_BAD_REQUEST);
        }

        $tranId = (string) $data['tran_id'];
        $status = (string) $data['status'];
        $amount = (float) $data['amount'];
        $hash = (string) $data['hash'];

        if (! $this->isValidWebhookHash($tranId, $amount, $status, $hash)) {
            Log::error('Payment webhook hash validation failed', [
                'tran_id' => $tranId,
                'status' => $status,
                'amount' => $amount,
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Invalid hash or status',
            ], Response::HTTP_BAD_REQUEST);
        }

        if (! $this->isSuccessfulPaymentStatus($status)) {
            Log::error('Payment webhook non-success status', [
                'tran_id' => $tranId,
                'status' => $status,
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Payment was not successful',
            ], Response::HTTP_BAD_REQUEST);
        }

        $order = Order::where('transaction_id', $tranId)->first();

        if (! $order) {
            Log::error('Payment webhook order not found', ['tran_id' => $tranId]);

            return response()->json([
                'status' => 'error',
                'message' => 'Order not found',
            ], Response::HTTP_NOT_FOUND);
        }

        // Idempotent: already paid
        if (strcasecmp((string) $order->status, 'PAID') === 0) {
            Log::info('Payment webhook ignored; order already paid', [
                'tran_id' => $tranId,
                'order_id' => $order->id,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Order already paid',
            ], Response::HTTP_OK);
        }

        if (! $order->isPending()) {
            Log::error('Payment webhook rejected; order not pending', [
                'tran_id' => $tranId,
                'order_id' => $order->id,
                'current_status' => $order->status,
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Order is not pending payment',
            ], Response::HTTP_BAD_REQUEST);
        }

        // Soft amount check (allow minor float differences)
        if (abs((float) $order->total - $amount) > 0.01) {
            Log::error('Payment webhook amount mismatch', [
                'tran_id' => $tranId,
                'order_id' => $order->id,
                'order_total' => $order->total,
                'webhook_amount' => $amount,
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Amount mismatch',
            ], Response::HTTP_BAD_REQUEST);
        }

        $order->update([
            'status' => 'PAID',
            'paid_at' => now(),
        ]);

        Log::info('Payment webhook success; order marked PAID', [
            'tran_id' => $tranId,
            'order_id' => $order->id,
            'amount' => $amount,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Order updated successfully',
        ], Response::HTTP_OK);
    }

    /**
     * Client Success Redirect URL after the customer returns from the gateway.
     *
     * Query params: tran_id and/or order_id.
     */
    public function paymentSuccess(Request $request): View|JsonResponse
    {
        $tranId = $request->query('tran_id');
        $orderId = $request->query('order_id');

        $order = null;

        if (filled($tranId)) {
            $order = Order::where('transaction_id', $tranId)->first();
        }

        if (! $order && filled($orderId)) {
            $order = Order::find($orderId);
        }

        if (! $order) {
            Log::warning('Payment success page: order not found', [
                'tran_id' => $tranId,
                'order_id' => $orderId,
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Order not found',
                ], Response::HTTP_NOT_FOUND);
            }

            return view('payment.success', [
                'found' => false,
                'order' => null,
                'shopUrl' => rtrim((string) config('services.payment.frontend_url'), '/').'/products',
            ]);
        }

        if ($request->expectsJson()) {
            return response()->json([
                'status' => 'success',
                'order' => [
                    'id' => $order->id,
                    'transaction_id' => $order->transaction_id,
                    'total' => $order->total,
                    'status' => $order->status,
                    'paid_at' => optional($order->paid_at ?? $order->updated_at)->toIso8601String(),
                ],
            ]);
        }

        return view('payment.success', [
            'found' => true,
            'order' => $order,
            'shopUrl' => rtrim((string) config('services.payment.frontend_url'), '/').'/products',
        ]);
    }

    /**
     * Gateway success statuses: SUCCESS, 0, PAID, COMPLETED (case-insensitive).
     */
    protected function isSuccessfulPaymentStatus(string $status): bool
    {
        $normalized = strtoupper(trim($status));

        return in_array($normalized, ['SUCCESS', '0', 'PAID', 'COMPLETED', 'OK'], true);
    }

    /**
     * Verify webhook integrity using HMAC-SHA256.
     *
     * Expected hash: hash_hmac('sha256', "{tran_id}|{amount}|{status}", PAYMENT_WEBHOOK_SECRET)
     * Amount is formatted with 2 decimals for stable hashing.
     */
    protected function isValidWebhookHash(string $tranId, float $amount, string $status, string $providedHash): bool
    {
        $secret = (string) config('services.payment.webhook_secret');

        if ($secret === '') {
            Log::warning('PAYMENT_WEBHOOK_SECRET is empty; rejecting webhook hash check');

            return false;
        }

        $payload = $tranId.'|'.number_format($amount, 2, '.', '').'|'.$status;
        $expected = hash_hmac('sha256', $payload, $secret);

        return hash_equals($expected, $providedHash);
    }
}
