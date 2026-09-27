'use client';

import { FormEvent, useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Order } from '@/types';
import { AdminPageHeader, AdminStatStrip, AdminTableShell, money } from '@/components/AdminUI';

type Replacement = {
  id: string;
  orderId: string;
  reason: string;
  status: string;
  adminNote?: string | null;
  createdAt?: string;
  orderTotal: number;
  user?: { id: string; name: string; email: string } | null;
};

const STATUSES = ['OPEN', 'APPROVED', 'REJECTED', 'DONE'] as const;

export default function AdminReplacementsPage() {
  const [items, setItems] = useState<Replacement[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderId, setOrderId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  function load() {
    Promise.all([api.get('/admin/replacements'), api.get('/admin/orders')])
      .then(([rep, ord]) => {
        setItems(rep.data.replacements || []);
        setOrders(ord.data.orders || []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!orderId || !reason.trim()) return;
    await api.post('/admin/replacements', { orderId, reason });
    setReason('');
    load();
  }

  async function update(id: string, status: string) {
    await api.patch(`/admin/replacements/${id}`, { status });
    load();
  }

  if (loading) {
    return <div className="border border-[var(--kk-line)] bg-white px-6 py-10 text-[var(--kk-mute)]">Loading replacements…</div>;
  }

  return (
    <div className="kk-rise space-y-5">
      <AdminPageHeader eyebrow="Ops" title="Replacements" subtitle="Track returns / size swaps" />
      <AdminStatStrip
        items={[
          { label: 'Total', value: items.length },
          { label: 'Open', value: items.filter((i) => i.status === 'OPEN').length, tone: 'text-[var(--kk-kick)]' },
          { label: 'Approved', value: items.filter((i) => i.status === 'APPROVED').length },
          { label: 'Done', value: items.filter((i) => i.status === 'DONE').length },
        ]}
      />

      <form onSubmit={onCreate} className="grid gap-3 border border-[var(--kk-line)] bg-white p-5 sm:grid-cols-[1fr_2fr_auto]">
        <select
          className="kk-admin-input"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          required
        >
          <option value="">Select order</option>
          {orders.map((o) => (
            <option key={o.id} value={o.id}>
              #{o.id.slice(-6)} · {o.user?.name} · {money(Number(o.total))}
            </option>
          ))}
        </select>
        <input
          className="kk-admin-input"
          placeholder="Reason (wrong size, damaged…)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
        <button type="submit" className="kk-admin-btn">
          Create
        </button>
      </form>

      <AdminTableShell>
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--kk-line)] text-[11px] uppercase tracking-[0.12em] text-[var(--kk-mute)]">
              <th className="px-5 py-3 font-semibold">Request</th>
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-5 py-3 font-semibold">Reason</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-[var(--kk-line)]/70 last:border-0">
                <td className="px-5 py-4">
                  <p className="font-semibold">#{item.orderId.slice(-6)}</p>
                  <p className="text-xs text-[var(--kk-mute)]">{money(item.orderTotal)}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium">{item.user?.name}</p>
                  <p className="text-xs text-[var(--kk-mute)]">{item.user?.email}</p>
                </td>
                <td className="px-5 py-4">{item.reason}</td>
                <td className="px-5 py-4">
                  <select
                    value={item.status}
                    onChange={(e) => update(item.id, e.target.value)}
                    className="kk-admin-input max-w-[140px] py-1.5"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-[var(--kk-mute)]">
                  No replacement requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminTableShell>
    </div>
  );
}
