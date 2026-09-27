'use client';

import { FormEvent, useEffect, useState } from 'react';
import api from '@/lib/api';
import { AdminPageHeader } from '@/components/AdminUI';

type SettingsMap = Record<string, string>;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/settings')
      .then((res) => setSettings(res.data.settings || {}))
      .finally(() => setLoading(false));
  }, []);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await api.put('/admin/settings', {
        store_name: settings.store_name,
        store_email: settings.store_email,
        store_phone: settings.store_phone,
        store_address: settings.store_address,
        currency: settings.currency,
        low_stock_threshold: Number(settings.low_stock_threshold || 8),
        shipping_note: settings.shipping_note,
      });
      setSettings(res.data.settings || settings);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="border border-[var(--kk-line)] bg-white px-6 py-10 text-[var(--kk-mute)]">Loading settings…</div>;
  }

  const fields: { key: string; label: string; type?: string }[] = [
    { key: 'store_name', label: 'Store name' },
    { key: 'store_email', label: 'Store email', type: 'email' },
    { key: 'store_phone', label: 'Phone' },
    { key: 'store_address', label: 'Address' },
    { key: 'currency', label: 'Currency' },
    { key: 'low_stock_threshold', label: 'Low stock threshold', type: 'number' },
  ];

  return (
    <div className="kk-rise space-y-5">
      <AdminPageHeader eyebrow="Team" title="Settings" subtitle="Store profile used across admin ops" />

      <form onSubmit={onSave} className="max-w-2xl space-y-4 border border-[var(--kk-line)] bg-white p-6">
        {fields.map((field) => (
          <label key={field.key} className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--kk-mute)]">
              {field.label}
            </span>
            <input
              className="kk-admin-input"
              type={field.type || 'text'}
              value={settings[field.key] || ''}
              onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
            />
          </label>
        ))}
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--kk-mute)]">
            Shipping note
          </span>
          <textarea
            className="kk-admin-input min-h-[100px]"
            value={settings.shipping_note || ''}
            onChange={(e) => setSettings({ ...settings, shipping_note: e.target.value })}
          />
        </label>
        <div className="flex items-center gap-3">
          <button type="submit" className="kk-admin-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save settings'}
          </button>
          {saved ? <span className="text-sm text-[var(--kk-ok)]">Saved</span> : null}
        </div>
      </form>
    </div>
  );
}
