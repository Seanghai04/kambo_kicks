'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { AdminPageHeader, AdminStatStrip, AdminTableShell, money } from '@/components/AdminUI';

type FinanceData = {
  grossRevenue: number;
  collectedRevenue: number;
  pendingRevenue: number;
  averageOrderValue: number;
  byStatus: { status: string; orders: number; amount: number }[];
  monthly: { month: string; orders: number; amount: number }[];
};

export default function AdminFinancePage() {
  const [finance, setFinance] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/finance')
      .then((res) => setFinance(res.data.finance))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !finance) {
    return <div className="border border-[var(--kk-line)] bg-white px-6 py-10 text-[var(--kk-mute)]">Loading finance…</div>;
  }

  return (
    <div className="kk-rise space-y-5">
      <AdminPageHeader eyebrow="Commerce" title="Finance" subtitle="Revenue and payment status from live orders" />
      <AdminStatStrip
        items={[
          { label: 'Gross revenue', value: money(finance.grossRevenue) },
          { label: 'Collected', value: money(finance.collectedRevenue), tone: 'text-[var(--kk-ok)]' },
          { label: 'Pending', value: money(finance.pendingRevenue), tone: 'text-[var(--kk-kick)]' },
          { label: 'Avg order', value: money(finance.averageOrderValue) },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <AdminTableShell>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--kk-line)] text-[11px] uppercase tracking-[0.12em] text-[var(--kk-mute)]">
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Orders</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {finance.byStatus.map((row) => (
                <tr key={row.status} className="border-b border-[var(--kk-line)]/70 last:border-0">
                  <td className="px-5 py-3 font-medium">{row.status}</td>
                  <td className="px-5 py-3">{row.orders}</td>
                  <td className="px-5 py-3">{money(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableShell>

        <AdminTableShell>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--kk-line)] text-[11px] uppercase tracking-[0.12em] text-[var(--kk-mute)]">
                <th className="px-5 py-3 font-semibold">Month</th>
                <th className="px-5 py-3 font-semibold">Orders</th>
                <th className="px-5 py-3 font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {finance.monthly.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-[var(--kk-mute)]">
                    No monthly data yet.
                  </td>
                </tr>
              ) : (
                finance.monthly.map((row) => (
                  <tr key={row.month} className="border-b border-[var(--kk-line)]/70 last:border-0">
                    <td className="px-5 py-3 font-medium">{row.month}</td>
                    <td className="px-5 py-3">{row.orders}</td>
                    <td className="px-5 py-3">{money(row.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </AdminTableShell>
      </div>
    </div>
  );
}
