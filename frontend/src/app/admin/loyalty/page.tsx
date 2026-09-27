'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { AdminPageHeader, AdminStatStrip, AdminTableShell, money } from '@/components/AdminUI';

type Member = {
  id: string;
  name: string;
  email: string;
  ordersCount: number;
  spent: number;
  points: number;
  tier: string;
};

export default function AdminLoyaltyPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/loyalty')
      .then((res) => setMembers(res.data.members || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="border border-[var(--kk-line)] bg-white px-6 py-10 text-[var(--kk-mute)]">Loading loyalty…</div>;
  }

  const gold = members.filter((m) => m.tier === 'Gold').length;

  return (
    <div className="kk-rise space-y-5">
      <AdminPageHeader
        eyebrow="Ops"
        title="Loyalty"
        subtitle="Points = lifetime spend (USD). Tiers: Bronze 50 · Silver 200 · Gold 500"
      />
      <AdminStatStrip
        items={[
          { label: 'Members', value: members.length },
          { label: 'Gold', value: gold, tone: 'text-[var(--kk-kick)]' },
          { label: 'Total points', value: members.reduce((s, m) => s + m.points, 0) },
          { label: 'Lifetime spend', value: money(members.reduce((s, m) => s + m.spent, 0)) },
        ]}
      />
      <AdminTableShell>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--kk-line)] text-[11px] uppercase tracking-[0.12em] text-[var(--kk-mute)]">
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-5 py-3 font-semibold">Orders</th>
              <th className="px-5 py-3 font-semibold">Spent</th>
              <th className="px-5 py-3 font-semibold">Points</th>
              <th className="px-5 py-3 font-semibold">Tier</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-[var(--kk-line)]/70 last:border-0">
                <td className="px-5 py-4">
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-[var(--kk-mute)]">{m.email}</p>
                </td>
                <td className="px-5 py-4">{m.ordersCount}</td>
                <td className="px-5 py-4">{money(m.spent)}</td>
                <td className="px-5 py-4 font-medium">{m.points}</td>
                <td className="px-5 py-4">
                  <span className="inline-flex bg-[var(--kk-ink)] px-2 py-1 text-[11px] font-bold text-white">
                    {m.tier}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableShell>
    </div>
  );
}
