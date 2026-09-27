'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { AdminPageHeader, AdminStatStrip, AdminTableShell } from '@/components/AdminUI';

type ProcItem = {
  id: string;
  productName?: string;
  brand?: string;
  category?: string;
  size: string;
  color: string;
  stock: number;
  suggestedOrder: number;
};

export default function AdminProcurementPage() {
  const [items, setItems] = useState<ProcItem[]>([]);
  const [threshold, setThreshold] = useState(8);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/procurement')
      .then((res) => {
        setItems(res.data.items || []);
        setThreshold(res.data.threshold ?? 8);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="border border-[var(--kk-line)] bg-white px-6 py-10 text-[var(--kk-mute)]">Loading procurement…</div>;
  }

  return (
    <div className="kk-rise space-y-5">
      <AdminPageHeader
        eyebrow="Commerce"
        title="Procurement"
        subtitle={`Suggested restocks under threshold ${threshold}`}
        action={
          <Link href="/admin/inventory" className="kk-admin-btn-ghost">
            Open inventory
          </Link>
        }
      />
      <AdminStatStrip
        items={[
          { label: 'Lines to reorder', value: items.length },
          { label: 'Suggested units', value: items.reduce((s, i) => s + i.suggestedOrder, 0) },
          { label: 'Out of stock', value: items.filter((i) => i.stock < 1).length, tone: 'text-[var(--kk-kick)]' },
          { label: 'Threshold', value: threshold },
        ]}
      />
      <AdminTableShell>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--kk-line)] text-[11px] uppercase tracking-[0.12em] text-[var(--kk-mute)]">
              <th className="px-5 py-3 font-semibold">Product</th>
              <th className="px-5 py-3 font-semibold">Variant</th>
              <th className="px-5 py-3 font-semibold">On hand</th>
              <th className="px-5 py-3 font-semibold">Suggested order</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-[var(--kk-line)]/70 last:border-0">
                <td className="px-5 py-4">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-xs text-[var(--kk-mute)]">
                    {item.brand} · {item.category}
                  </p>
                </td>
                <td className="px-5 py-4">
                  {item.size} · {item.color}
                </td>
                <td className="px-5 py-4 font-semibold text-[var(--kk-kick)]">{item.stock}</td>
                <td className="px-5 py-4 font-medium">{item.suggestedOrder}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-[var(--kk-mute)]">
                  Stock looks healthy — nothing to reorder.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminTableShell>
    </div>
  );
}
