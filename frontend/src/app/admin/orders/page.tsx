'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Order } from '@/types';

const statuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'] as const;

function statusTone(status: Order['status']) {
  switch (status) {
    case 'PENDING':
      return 'bg-[var(--kk-kick-soft)] text-[var(--kk-kick)]';
    case 'PAID':
      return 'bg-[#e4eef8] text-[var(--kk-info)]';
    case 'SHIPPED':
      return 'bg-[#e4f3ee] text-[var(--kk-ok)]';
    case 'DELIVERED':
      return 'bg-[#eceef2] text-[var(--kk-slate)]';
    default:
      return 'bg-[#eceef2] text-[var(--kk-mute)]';
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  function loadOrders() {
    api
      .get('/admin/orders')
      .then((res) => setOrders(res.data.orders))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(id: string, status: Order['status']) {
    await api.patch(`/orders/${id}/status`, { status });
    loadOrders();
  }

  if (loading) {
    return (
      <div className="border border-[var(--kk-line)] bg-white/70 px-6 py-10 text-[var(--kk-mute)]">
        Loading sales…
      </div>
    );
  }

  return (
    <div className="kk-rise space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--kk-kick)]">
            Commerce
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
            All orders
          </h2>
          <p className="mt-1 text-sm text-[var(--kk-mute)]">{orders.length} total checkouts</p>
        </div>
      </div>

      <div className="border border-[var(--kk-line)] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--kk-line)] text-[11px] uppercase tracking-[0.12em] text-[var(--kk-mute)]">
                <th className="px-5 py-3 font-semibold">Order</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Total</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[var(--kk-line)]/70 last:border-0 hover:bg-[var(--kk-chalk)]"
                >
                  <td className="px-5 py-4 font-semibold">#{order.id.slice(-6)}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium">{order.user?.name}</p>
                    <p className="text-xs text-[var(--kk-mute)]">{order.user?.email}</p>
                  </td>
                  <td className="px-5 py-4 font-medium">${Number(order.total).toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex px-2 py-1 text-[11px] font-bold tracking-wide ${statusTone(order.status)}`}
                      >
                        {order.status}
                      </span>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatus(order.id, e.target.value as Order['status'])
                        }
                        className="border border-[var(--kk-line)] bg-white px-2 py-1 text-xs outline-none focus:border-[var(--kk-ink)]"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[var(--kk-mute)]">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="px-5 py-12 text-center text-[var(--kk-mute)]">No orders yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
