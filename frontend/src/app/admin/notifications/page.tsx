'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { AdminPageHeader, AdminStatStrip } from '@/components/AdminUI';

type Note = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string;
  level: string;
};

export default function AdminNotificationsPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/notifications')
      .then((res) => setNotes(res.data.notifications || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="border border-[var(--kk-line)] bg-white px-6 py-10 text-[var(--kk-mute)]">Loading notifications…</div>;
  }

  return (
    <div className="kk-rise space-y-5">
      <AdminPageHeader
        eyebrow="Ops"
        title="Notifications"
        subtitle="Live alerts from orders, stock, messages, and replacements"
      />
      <AdminStatStrip
        items={[
          { label: 'Open alerts', value: notes.length },
          { label: 'Inventory', value: notes.filter((n) => n.type === 'inventory').length },
          { label: 'Orders', value: notes.filter((n) => n.type === 'orders' || n.type === 'delivery').length },
          { label: 'Other', value: notes.filter((n) => !['inventory', 'orders', 'delivery'].includes(n.type)).length },
        ]}
      />

      <div className="space-y-3">
        {notes.map((note) => (
          <Link
            key={note.id}
            href={note.href}
            className="block border border-[var(--kk-line)] bg-white px-5 py-4 transition hover:border-[var(--kk-ink)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--kk-mute)]">
                  {note.type}
                </p>
                <p className="mt-1 font-semibold">{note.title}</p>
                <p className="mt-1 text-sm text-[var(--kk-slate)]">{note.body}</p>
              </div>
              <span
                className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                  note.level === 'danger'
                    ? 'bg-black text-white'
                    : note.level === 'warn'
                      ? 'bg-[var(--kk-kick-soft)] text-[var(--kk-kick)]'
                      : 'bg-[#e4eef8] text-[var(--kk-info)]'
                }`}
              >
                {note.level}
              </span>
            </div>
          </Link>
        ))}
        {notes.length === 0 && (
          <div className="border border-[var(--kk-line)] bg-white px-5 py-10 text-center text-[var(--kk-mute)]">
            All clear — no alerts right now.
          </div>
        )}
      </div>
    </div>
  );
}
