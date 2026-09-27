'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { AdminPageHeader, AdminStatStrip, AdminTableShell } from '@/components/AdminUI';

type InventoryItem = {
  id: string;
  productName?: string;
  brand?: string;
  category?: string;
  size: string;
  color: string;
  stock: number;
  lowStock: boolean;
  outOfStock: boolean;
};

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState({ variants: 0, lowStock: 0, outOfStock: 0, units: 0 });
  const [threshold, setThreshold] = useState(8);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [loading, setLoading] = useState(true);

  function load() {
    api
      .get('/admin/inventory')
      .then((res) => {
        setItems(res.data.items || []);
        setSummary(res.data.summary || { variants: 0, lowStock: 0, outOfStock: 0, units: 0 });
        setThreshold(res.data.threshold ?? 8);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function saveStock(id: string, stock: number) {
    await api.patch(`/admin/inventory/${id}`, { stock });
    load();
  }

  const visible = useMemo(() => {
    if (filter === 'low') return items.filter((i) => i.lowStock);
    if (filter === 'out') return items.filter((i) => i.outOfStock);
    return items;
  }, [filter, items]);

  if (loading) {
    return <div className="border border-[var(--kk-line)] bg-white px-6 py-10 text-[var(--kk-mute)]">Loading inventory…</div>;
  }

  return (
    <div className="kk-rise space-y-5">
      <AdminPageHeader
        eyebrow="Commerce"
        title="Inventory"
        subtitle={`Low-stock threshold: ${threshold} units`}
        action={
          <div className="flex gap-2">
            {(['all', 'low', 'out'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={filter === key ? 'kk-admin-btn' : 'kk-admin-btn-ghost'}
              >
                {key === 'all' ? 'All' : key === 'low' ? 'Low stock' : 'Out of stock'}
              </button>
            ))}
          </div>
        }
      />
      <AdminStatStrip
        items={[
          { label: 'Variants', value: summary.variants },
          { label: 'Units on hand', value: summary.units },
          { label: 'Low stock', value: summary.lowStock, tone: 'text-[var(--kk-kick)]' },
          { label: 'Out of stock', value: summary.outOfStock, tone: 'text-[var(--kk-kick)]' },
        ]}
      />
      <AdminTableShell>
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--kk-line)] text-[11px] uppercase tracking-[0.12em] text-[var(--kk-mute)]">
              <th className="px-5 py-3 font-semibold">Product</th>
              <th className="px-5 py-3 font-semibold">Variant</th>
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="px-5 py-3 font-semibold">Stock</th>
              <th className="px-5 py-3 font-semibold">Update</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => (
              <tr key={item.id} className="border-b border-[var(--kk-line)]/70 last:border-0 hover:bg-[var(--kk-chalk)]">
                <td className="px-5 py-4">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-xs text-[var(--kk-mute)]">{item.brand}</p>
                </td>
                <td className="px-5 py-4">
                  {item.size} · {item.color}
                </td>
                <td className="px-5 py-4">{item.category}</td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-[11px] font-bold ${
                      item.outOfStock
                        ? 'bg-black text-white'
                        : item.lowStock
                          ? 'bg-[var(--kk-kick-soft)] text-[var(--kk-kick)]'
                          : 'bg-[#e4f3ee] text-[var(--kk-ok)]'
                    }`}
                  >
                    {item.stock}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <form
                    className="flex items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      saveStock(item.id, Number(fd.get('stock')));
                    }}
                  >
                    <input
                      name="stock"
                      type="number"
                      min={0}
                      defaultValue={item.stock}
                      className="kk-admin-input w-24 py-1.5"
                    />
                    <button type="submit" className="kk-admin-btn-ghost px-3 py-1.5 text-xs">
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[var(--kk-mute)]">
                  No variants in this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminTableShell>
    </div>
  );
}
