'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/Guards';
import api from '@/lib/api';
import type { Order } from '@/types';

function statusColor(status: Order['status']) {
  const map = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    SHIPPED: 'bg-blue-100 text-blue-800',
    DELIVERED: 'bg-gray-100 text-gray-800',
  };
  return map[status];
}

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/orders')
      .then((res) => setOrders(res.data.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">My Orders</h1>
      <p className="mt-1 text-sm text-gray-500">Track your purchase history</p>

      {loading && <p className="mt-8 text-gray-500">Loading…</p>}

      {!loading && orders.length === 0 && (
        <div className="mt-8">
          <p className="text-gray-500">You have no orders yet.</p>
          <Link href="/products" className="btn mt-4 inline-flex">
            Start Shopping
          </Link>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="block rounded-lg border border-gray-200 p-5 hover:border-gray-400"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className="font-medium">Order #{order.id.slice(-8).toUpperCase()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(order.status)}`}>
                  {order.status}
                </span>
                <span className="font-semibold">${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {order.items.length} item(s) · {order.address}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AuthGuard>
      <OrdersContent />
    </AuthGuard>
  );
}
