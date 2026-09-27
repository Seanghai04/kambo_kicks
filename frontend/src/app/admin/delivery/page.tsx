'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Order } from '@/types';
import { AdminPageHeader, AdminStatStrip, AdminTableShell, money } from '@/components/AdminUI';

export default function AdminDeliveryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState({ ready: 0, shipped: 0, delivered: 0 });
  const [loading, setLoading] = useState(true);

  function load() {
    api
      .get('/admin/delivery')
      .then((res) => {
        setOrders(res.data.orders || []);
        setSummary(res.data.summary || { ready: 0, shipped: 0, delivered: 0 });
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: Order['status']) {
    await api.patch(`/orders/${id}/status`, { status });
    load();
  }

  if (loading) {
    return <div className="border border-[var(--kk-line)] bg-white px-6 py-10 text-[var(--kk-mute)]">Loading delivery…</div>;
  }

  return (
    <div className="kk-rise space-y-5">
      <AdminPageHeader
        eyebrow="Commerce"
        title="Delivery"
        subtitle="Move paid orders through shipped → delivered"
      />
      <AdminStatStrip
        items={[
          { label: 'Ready to ship', value: summary.ready, tone: 'text-[var(--kk-info)]' },
          { label: 'In transit', value: summary.shipped },
          { label: 'Delivered', value: summary.delivered, tone: 'text-[var(--kk-ok)]' },
          { label: 'On board', value: orders.length },
        ]}
      />
      <AdminTableShell>
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--kk-line)] text-[11px] uppercase tracking-[0.12em] text-[var(--kk-mute)]">
              <th className="px-5 py-3 font-semibold">Order</th>
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-5 py-3 font-semibold">Address</th>
              <th className="px-5 py-3 font-semibold">Total</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-[var(--kk-line)]/70 last:border-0 hover:bg-[var(--kk-chalk)]">
                <td className="px-5 py-4 font-semibold">#{order.id.slice(-6)}</td>
                <td className="px-5 py-4">
                  <p className="font-medium">{order.user?.name}</p>
                  <p className="text-xs text-[var(--kk-mute)]">{order.user?.email}</p>
                </td>
                <td className="max-w-[240px] truncate px-5 py-4 text-[var(--kk-slate)]">{order.address}</td>
                <td className="px-5 py-4">{money(Number(order.total))}</td>
                <td className="px-5 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value as Order['status'])}
                    className="kk-admin-input max-w-[150px] py-1.5"
                  >
                    <option value="PAID">PAID</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[var(--kk-mute)]">
                  No paid/shipped orders yet. Mark sales as PAID first.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminTableShell>
    </div>
  );
}
