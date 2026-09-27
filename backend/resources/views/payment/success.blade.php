<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Payment Successful — KAMBO-KICKS</title>
    <style>
        :root {
            --bg: #f4f6f8;
            --card: #ffffff;
            --ink: #111111;
            --muted: #667085;
            --line: #e6e8ec;
            --ok: #067647;
            --ok-bg: #ecfdf3;
            --ok-ring: #abefc6;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 24px;
            font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
            color: var(--ink);
            background:
                radial-gradient(1200px 500px at 10% -10%, #dbeafe 0%, transparent 55%),
                radial-gradient(900px 400px at 100% 0%, #fce7f3 0%, transparent 50%),
                var(--bg);
        }
        .card {
            width: 100%;
            max-width: 480px;
            background: var(--card);
            border: 1px solid var(--line);
            border-radius: 16px;
            padding: 36px 28px;
            box-shadow: 0 18px 40px rgba(16, 24, 40, 0.08);
            text-align: center;
        }
        .icon {
            width: 72px;
            height: 72px;
            margin: 0 auto 18px;
            border-radius: 999px;
            display: grid;
            place-items: center;
            background: var(--ok-bg);
            border: 2px solid var(--ok-ring);
            color: var(--ok);
        }
        .icon svg { width: 36px; height: 36px; }
        h1 {
            margin: 0 0 8px;
            font-size: 1.55rem;
            letter-spacing: -0.02em;
        }
        .subtitle {
            margin: 0 0 28px;
            color: var(--muted);
            font-size: 0.95rem;
            line-height: 1.5;
        }
        .summary {
            text-align: left;
            border: 1px solid var(--line);
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 28px;
        }
        .row {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            padding: 14px 16px;
            font-size: 0.92rem;
        }
        .row + .row { border-top: 1px solid var(--line); }
        .row span { color: var(--muted); }
        .row strong { color: var(--ink); font-weight: 600; }
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            min-height: 48px;
            border-radius: 10px;
            border: 0;
            background: #111;
            color: #fff;
            text-decoration: none;
            font-weight: 600;
            font-size: 0.95rem;
            transition: opacity .15s ease;
        }
        .btn:hover { opacity: 0.88; }
        .error h1 { color: #b42318; }
        .badge {
            display: inline-block;
            margin-bottom: 12px;
            padding: 4px 10px;
            border-radius: 999px;
            background: var(--ok-bg);
            color: var(--ok);
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }
        @media (max-width: 420px) {
            .card { padding: 28px 20px; }
            h1 { font-size: 1.35rem; }
        }
    </style>
</head>
<body>
    <main class="card {{ $found ? '' : 'error' }}">
        @if ($found)
            <div class="icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                </svg>
            </div>
            <div class="badge">{{ strtoupper($order->status) }}</div>
            <h1>Payment Successful!</h1>
            <p class="subtitle">Thank you. Your payment was received and your order is confirmed.</p>

            <div class="summary">
                <div class="row">
                    <span>Order ID</span>
                    <strong>#{{ $order->id }}</strong>
                </div>
                <div class="row">
                    <span>Transaction ID</span>
                    <strong>{{ $order->transaction_id ?: '—' }}</strong>
                </div>
                <div class="row">
                    <span>Total Amount</span>
                    <strong>${{ number_format((float) $order->total, 2) }}</strong>
                </div>
                <div class="row">
                    <span>Payment Date</span>
                    <strong>
                        {{ optional($order->paid_at ?? $order->updated_at)->timezone(config('app.timezone'))->format('d M Y, H:i') }}
                    </strong>
                </div>
            </div>
        @else
            <div class="icon" aria-hidden="true" style="background:#fef3f2;border-color:#fecdca;color:#b42318;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
            </div>
            <h1>Order Not Found</h1>
            <p class="subtitle">We could not find this payment. If you were charged, contact support with your transaction ID.</p>
        @endif

        <a class="btn" href="{{ $shopUrl }}">Continue Shopping</a>
    </main>
</body>
</html>
