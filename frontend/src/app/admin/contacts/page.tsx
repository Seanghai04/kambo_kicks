'use client';

import { FormEvent, useEffect, useState } from 'react';
import api from '@/lib/api';
import { AdminPageHeader, AdminStatStrip, AdminTableShell } from '@/components/AdminUI';

type Message = {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  body: string;
  status: string;
  createdAt?: string;
};

const STATUSES = ['NEW', 'READ', 'REPLIED', 'ARCHIVED'] as const;

export default function AdminContactsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', subject: '', body: '' });

  function load() {
    api
      .get('/admin/contacts')
      .then((res) => setMessages(res.data.messages || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    await api.post('/admin/contacts', form);
    setForm({ name: '', email: '', subject: '', body: '' });
    load();
  }

  async function setStatus(id: string, status: string) {
    await api.patch(`/admin/contacts/${id}`, { status });
    load();
  }

  if (loading) {
    return <div className="border border-[var(--kk-line)] bg-white px-6 py-10 text-[var(--kk-mute)]">Loading contacts…</div>;
  }

  const unread = messages.filter((m) => m.status === 'NEW').length;

  return (
    <div className="kk-rise space-y-5">
      <AdminPageHeader eyebrow="Ops" title="Contacts" subtitle="Inbox for store inquiries" />
      <AdminStatStrip
        items={[
          { label: 'Total', value: messages.length },
          { label: 'New', value: unread, tone: 'text-[var(--kk-kick)]' },
          { label: 'Replied', value: messages.filter((m) => m.status === 'REPLIED').length },
          { label: 'Archived', value: messages.filter((m) => m.status === 'ARCHIVED').length },
        ]}
      />

      <form onSubmit={onCreate} className="grid gap-3 border border-[var(--kk-line)] bg-white p-5 sm:grid-cols-2">
        <p className="sm:col-span-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--kk-mute)]">
          Add message (demo / manual entry)
        </p>
        <input
          className="kk-admin-input"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="kk-admin-input"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="kk-admin-input sm:col-span-2"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        />
        <textarea
          className="kk-admin-input min-h-[90px] sm:col-span-2"
          placeholder="Message"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          required
        />
        <button type="submit" className="kk-admin-btn sm:col-span-2 sm:w-fit">
          Save message
        </button>
      </form>

      <AdminTableShell>
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--kk-line)] text-[11px] uppercase tracking-[0.12em] text-[var(--kk-mute)]">
              <th className="px-5 py-3 font-semibold">From</th>
              <th className="px-5 py-3 font-semibold">Message</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((m) => (
              <tr key={m.id} className="border-b border-[var(--kk-line)]/70 last:border-0 align-top">
                <td className="px-5 py-4">
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-[var(--kk-mute)]">{m.email}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium">{m.subject || '(no subject)'}</p>
                  <p className="mt-1 text-[var(--kk-slate)]">{m.body}</p>
                </td>
                <td className="px-5 py-4">
                  <select
                    value={m.status}
                    onChange={(e) => setStatus(m.id, e.target.value)}
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
            {messages.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-[var(--kk-mute)]">
                  No messages yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminTableShell>
    </div>
  );
}
