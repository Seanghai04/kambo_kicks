'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthGuard } from '@/components/Guards';
import api from '@/lib/api';
import type { Order } from '@/types';

function CheckoutSuccessInner() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setError('Missing order id.');
      return;
    }
    api
      .get(`/orders/${orderId}`)
      .then((res) => setOrder(res.data.order as Order))
      .catch(() => setError('Could not load this order.'));
  }, [orderId]);

  if (error) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Order not found</h1>
        <p className="mt-3 text-gray-500">{error}</p>
        <Link href="/orders" className="btn mt-8 inline-flex">
          My orders
        </Link>
      </main>
    );
  }

  if (!order) {
    return <div className="py-20 text-center text-gray-500">Loading order…</div>;
  }

  const paymentLabel =
    order.paymentMethod === 'aba'
      ? 'ABA Pay'
      : order.paymentMethod === 'cod'
        ? 'Cash on Delivery'
        : order.paymentMethod || '—';

  const shippingLabel =
    order.shippingMethod === 'express'
      ? 'Express'
      : order.shippingMethod === 'standard'
        ? 'Standard'
        : order.shippingMethod || '—';

  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <div className="rounded-2xl border border-[#e8e8e8] bg-white p-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ecfdf3] text-[#067647]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#067647]">
          Order placed
        </p>
        <h1 className="mt-2 text-2xl font-bold">Thank you!</h1>
        <p className="mt-2 text-sm text-gray-500">
          Your order was created successfully and is currently{' '}
          <span className="font-medium text-black">{order.status}</span>.
        </p>

        <div className="mt-8 space-y-3 rounded-xl border border-[#eee] bg-[#fafafa] p-4 text-left text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Order ID</span>
            <span className="font-medium">#{order.id}</span>
          </div>
          {order.transactionId && (
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Transaction</span>
              <span className="max-w-[60%] truncate font-medium">{order.transactionId}</span>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Shipping</span>
            <span className="font-medium">{shippingLabel}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Payment</span>
            <span className="font-medium">{paymentLabel}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-[#e8e8e8] pt-3">
            <span className="text-gray-500">Total</span>
            <span className="font-semibold">${Number(order.total).toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={`/orders/${order.id}`} className="btn flex-1">
            View order
          </Link>
          <Link href="/products" className="btn-outline flex-1 text-center">
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

function CheckoutSuccessContent() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-500">Loading…</div>}>
      <CheckoutSuccessInner />
    </Suspense>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <AuthGuard>
      <CheckoutSuccessContent />
    </AuthGuard>
  );
}
