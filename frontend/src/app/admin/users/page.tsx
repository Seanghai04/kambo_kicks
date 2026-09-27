'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { AdminPageHeader, AdminStatStrip, AdminTableShell, money } from '@/components/AdminUI';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  ordersCount: number;
  spent: number;
  createdAt?: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    api
      .get('/admin/users')
      .then((res) => setUsers(res.data.users || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function setRole(id: string, role: 'USER' | 'ADMIN') {
    await api.patch(`/admin/users/${id}`, { role });
    load();
  }

  if (loading) {
    return <div className="border border-[var(--kk-line)] bg-white px-6 py-10 text-[var(--kk-mute)]">Loading users…</div>;
  }

  const admins = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <div className="kk-rise space-y-5">
      <AdminPageHeader
        eyebrow="Team"
        title="Users"
        subtitle={`${users.length} accounts · ${admins} admin`}
      />
      <AdminStatStrip
        items={[
          { label: 'Total users', value: users.length },
          { label: 'Admins', value: admins },
          { label: 'Customers', value: users.length - admins },
          { label: 'Total spent', value: money(users.reduce((s, u) => s + u.spent, 0)) },
        ]}
      />
      <AdminTableShell>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--kk-line)] text-[11px] uppercase tracking-[0.12em] text-[var(--kk-mute)]">
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Orders</th>
              <th className="px-5 py-3 font-semibold">Spent</th>
              <th className="px-5 py-3 font-semibold">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-[var(--kk-line)]/70 last:border-0 hover:bg-[var(--kk-chalk)]">
                <td className="px-5 py-4">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-[var(--kk-mute)]">{user.email}</p>
                </td>
                <td className="px-5 py-4">{user.ordersCount}</td>
                <td className="px-5 py-4 font-medium">{money(user.spent)}</td>
                <td className="px-5 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => setRole(user.id, e.target.value as 'USER' | 'ADMIN')}
                    className="kk-admin-input max-w-[140px] py-1.5"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableShell>
    </div>
  );
}
