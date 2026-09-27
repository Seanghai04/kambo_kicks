'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AuthGuard } from '@/components/Guards';
import api from '@/lib/api';
import type { Order } from '@/types';

function OrderDetailContent() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!params.id) return;
    api.get(`/orders/${params.id}`).then((res) => setOrder(res.data.order));
  }, [params.id]);

  if (!order) {
    return <div className="py-20 text-center text-gray-500">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/orders" className="text-sm text-gray-500 hover:text-black">
        ← Back to orders
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Order Details</h1>
      <p className="text-sm text-gray-500">#{order.id.slice(-8).toUpperCase()}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Status</p>
          <p className="font-semibold">{order.status}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="font-semibold">${Number(order.total).toFixed(2)}</p>
        </div>
        {order.customerName && (
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Customer</p>
            <p className="font-medium">{order.customerName}</p>
            {order.phone && <p className="mt-1 text-sm text-gray-500">{order.phone}</p>}
          </div>
        )}
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Payment / Shipping</p>
          <p className="font-medium">
            {(order.paymentMethod || '—').toUpperCase()} · {(order.shippingMethod || '—')}
          </p>
          {typeof order.shippingFee === 'number' && (
            <p className="mt-1 text-sm text-gray-500">
              Shipping fee: ${Number(order.shippingFee).toFixed(2)}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-gray-50 p-4 sm:col-span-2">
          <p className="text-sm text-gray-500">Delivery Address</p>
          <p className="font-medium">{order.address}</p>
          {order.note && (
            <p className="mt-2 text-sm text-gray-500">Note: {order.note}</p>
          )}
        </div>
      </div>

      <h2 className="mt-8 font-semibold">Items</h2>
      <div className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between p-4">
            <div>
              <p className="font-medium">{item.productVariant?.product?.name}</p>
              <p className="text-sm text-gray-500">
                {item.productVariant?.color} · {item.productVariant?.size} · Qty {item.quantity}
              </p>
            </div>
            <p className="font-medium">${(Number(item.price) * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <AuthGuard>
      <OrderDetailContent />
    </AuthGuard>
  );
}
