'use client';

import type { ReactNode } from 'react';

export function money(value: number) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function AdminPageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--kk-kick)]">
          {eyebrow}
        </p>
        <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
          {title}
        </h2>
        {subtitle ? <p className="mt-1 text-sm text-[var(--kk-mute)]">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function AdminStatStrip({
  items,
}: {
  items: { label: string; value: string | number; tone?: string }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="border border-[var(--kk-line)] bg-white px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--kk-mute)]">
            {item.label}
          </p>
          <p className={`mt-2 text-2xl font-semibold ${item.tone || 'text-[var(--kk-ink)]'}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function AdminTableShell({ children }: { children: ReactNode }) {
  return (
    <div className="border border-[var(--kk-line)] bg-white">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
