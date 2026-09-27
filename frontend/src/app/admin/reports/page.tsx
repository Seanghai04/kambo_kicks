'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { AdminPageHeader, AdminStatStrip, AdminTableShell, money } from '@/components/AdminUI';

type Reports = {
  topProducts: {
    variantId: string;
    productName: string;
    size?: string;
    color?: string;
    category?: string;
    units: number;
    revenue: number;
  }[];
  byCategory: { category: string; products: number }[];
  customers: number;
  admins: number;
  orders: number;
  revenue: number;
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Reports | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/reports')
      .then((res) => setReports(res.data.reports))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !reports) {
    return <div className="border border-[var(--kk-line)] bg-white px-6 py-10 text-[var(--kk-mute)]">Loading reports…</div>;
  }

  return (
    <div className="kk-rise space-y-5">
      <AdminPageHeader eyebrow="Ops" title="Reports" subtitle="Best sellers and catalog mix" />
      <AdminStatStrip
        items={[
          { label: 'Revenue', value: money(reports.revenue) },
          { label: 'Orders', value: reports.orders },
          { label: 'Customers', value: reports.customers },
          { label: 'Admins', value: reports.admins },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <AdminTableShell>
          <div className="border-b border-[var(--kk-line)] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--kk-mute)]">
            Top products
          </div>
          <table className="w-full text-left text-sm">
            <tbody>
              {reports.topProducts.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-[var(--kk-mute)]">No sales yet.</td>
                </tr>
              ) : (
                reports.topProducts.map((row, index) => (
                  <tr key={row.variantId} className="border-b border-[var(--kk-line)]/70 last:border-0">
                    <td className="px-5 py-3 text-[var(--kk-mute)]">#{index + 1}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium">{row.productName}</p>
                      <p className="text-xs text-[var(--kk-mute)]">
                        {row.size} · {row.color} · {row.category}
                      </p>
                    </td>
                    <td className="px-5 py-3">{row.units} sold</td>
                    <td className="px-5 py-3 font-medium">{money(row.revenue)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </AdminTableShell>

        <AdminTableShell>
          <div className="border-b border-[var(--kk-line)] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--kk-mute)]">
            Catalog by category
          </div>
          <table className="w-full text-left text-sm">
            <tbody>
              {reports.byCategory.map((row) => (
                <tr key={row.category} className="border-b border-[var(--kk-line)]/70 last:border-0">
                  <td className="px-5 py-3 font-medium">{row.category}</td>
                  <td className="px-5 py-3 text-right">{row.products} products</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableShell>
      </div>
    </div>
  );
}
