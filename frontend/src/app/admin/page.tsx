'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Package } from 'lucide-react';
import api from '@/lib/api';
import type { AdminStats, Order } from '@/types';

function money(value: number) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function statusTone(status: Order['status']) {
  switch (status) {
    case 'PENDING':
      return 'bg-[var(--kk-kick-soft)] text-[var(--kk-kick)]';
    case 'PAID':
      return 'bg-[#e4eef8] text-[var(--kk-info)]';
    case 'SHIPPED':
      return 'bg-[#e4f3ee] text-[var(--kk-ok)]';
    case 'DELIVERED':
      return 'bg-[#eceef2] text-[var(--kk-slate)]';
    default:
      return 'bg-[#eceef2] text-[var(--kk-mute)]';
  }
}

function RevenueChart({ data }: { data: { date: string; amount: number }[] }) {
  const width = 720;
  const height = 210;
  const padX = 8;
  const padY = 16;
  const max = Math.max(...data.map((d) => d.amount), 1);

  const points = data.map((d, i) => {
    const x = padX + (i / Math.max(data.length - 1, 1)) * (width - padX * 2);
    const y = height - padY - (d.amount / max) * (height - padY * 2);
    return { x, y, ...d };
  });

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = `${line} L ${points[points.length - 1]?.x ?? padX} ${height - padY} L ${padX} ${height - padY} Z`;

  const labels = [0, Math.floor(data.length / 2), data.length - 1]
    .filter((i, idx, arr) => arr.indexOf(i) === idx && i >= 0 && i < data.length)
    .map((i) => ({
      x: points[i].x,
      label: new Date(data[i].date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      }),
    }));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[210px] w-full">
      <defs>
        <linearGradient id="kkRevenueFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff5c2e" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ff5c2e" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((t) => {
        const y = padY + (1 - t) * (height - padY * 2);
        return (
          <line
            key={t}
            x1={padX}
            x2={width - padX}
            y1={y}
            y2={y}
            stroke="#d3d6dd"
            strokeWidth="1"
          />
        );
      })}
      <path d={area} fill="url(#kkRevenueFill)" />
      <path
        d={line}
        className="kk-chart-line"
        fill="none"
        stroke="#ff5c2e"
        strokeWidth="2.75"
        strokeLinejoin="round"
      />
      {points
        .filter((p) => p.amount > 0)
        .map((p) => (
          <circle key={p.date} cx={p.x} cy={p.y} r="3.5" fill="#121417" />
        ))}
      {labels.map((l) => (
        <text
          key={l.label + l.x}
          x={l.x}
          y={height - 2}
          textAnchor="middle"
          fill="#6d7582"
          fontSize="11"
        >
          {l.label}
        </text>
      ))}
    </svg>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((res) => setStats(res.data.stats))
      .catch(() => setStats(null));
  }, []);

  const chartData = useMemo(() => {
    if (!stats?.dailyRevenue) return [];
    if (range === '7d') return stats.dailyRevenue.slice(-7);
    return stats.dailyRevenue;
  }, [range, stats]);

  if (!stats) {
    return (
      <div className="border border-[var(--kk-line)] bg-white/70 px-6 py-10 text-[var(--kk-mute)]">
        Loading floor pulse…
      </div>
    );
  }

  const pipeline = stats.ordersByStatus || [];
  const pipelineMax = Math.max(...pipeline.map((i) => i.count), 1);

  return (
    <div className="space-y-8">
      <section className="kk-rise relative overflow-hidden border border-[var(--kk-ink)] bg-[var(--kk-ink)] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'linear-gradient(120deg, transparent 0%, transparent 46%, #ff5c2e 46%, #ff5c2e 52%, transparent 52%)',
          }}
        />
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--kk-kick)]">
              Today on the floor
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-5xl font-semibold leading-none tracking-tight sm:text-6xl">
              {money(stats.revenueToday)}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/65">
              Live take for Kambo-Kicks. Month to date sits at {money(stats.revenueMonth)} across{' '}
              {stats.orders30d} orders in the last 30 days.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-white/15 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                30d revenue
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">
                {money(stats.revenue30d)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                Customers
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">
                {stats.users}
              </p>
              <p className="mt-1 text-xs text-white/45">+{stats.newCustomers30d} new · 30d</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                Catalog
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">
                {stats.products}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                Pending
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--kk-kick)]">
                {stats.pending}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="kk-rise kk-rise-delay-1 border border-[var(--kk-line)] bg-white p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
              Order pipeline
            </h2>
            <p className="mt-1 text-sm text-[var(--kk-mute)]">Where every pair sits right now</p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--kk-ink)] hover:text-[var(--kk-kick)]"
          >
            Open sales
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {pipeline.map((item, index) => (
            <div key={item.status} className="border-t-2 border-[var(--kk-ink)] pt-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--kk-mute)]">
                  {item.label}
                </p>
                <p className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-none">
                  {item.count}
                </p>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden bg-[var(--kk-paper)]">
                <div
                  className="kk-pipeline-fill h-full bg-[var(--kk-kick)]"
                  style={{
                    width: `${Math.max((item.count / pipelineMax) * 100, item.count > 0 ? 8 : 0)}%`,
                    animationDelay: `${index * 0.08}s`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="kk-rise kk-rise-delay-2 border border-[var(--kk-line)] bg-white p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
              Revenue trail
            </h2>
            <p className="mt-1 text-sm text-[var(--kk-mute)]">Daily store sales over the selected window</p>
          </div>
          <div className="flex items-center gap-1 border border-[var(--kk-line)] p-1">
            {(['7d', '30d', '90d'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setRange(key)}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                  range === key
                    ? 'bg-[var(--kk-ink)] text-white'
                    : 'text-[var(--kk-mute)] hover:text-[var(--kk-ink)]'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
        <RevenueChart data={chartData} />
      </section>

      <section className="kk-rise kk-rise-delay-3 border border-[var(--kk-line)] bg-white">
        <div className="flex items-end justify-between gap-3 border-b border-[var(--kk-line)] px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
              Latest drops
            </h2>
            <p className="mt-1 text-sm text-[var(--kk-mute)]">Most recent customer checkouts</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-sm font-semibold text-[var(--kk-kick)] hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--kk-line)] text-[11px] uppercase tracking-[0.12em] text-[var(--kk-mute)]">
                <th className="px-5 py-3 font-semibold sm:px-6">Order</th>
                <th className="px-5 py-3 font-semibold sm:px-6">Customer</th>
                <th className="px-5 py-3 font-semibold sm:px-6">Amount</th>
                <th className="px-5 py-3 font-semibold sm:px-6">Status</th>
                <th className="px-5 py-3 font-semibold sm:px-6">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders?.length ? (
                stats.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[var(--kk-line)]/70 last:border-0 hover:bg-[var(--kk-chalk)]"
                  >
                    <td className="px-5 py-4 font-semibold sm:px-6">
                      #{String(order.id).slice(-6)}
                    </td>
                    <td className="px-5 py-4 sm:px-6">
                      <p className="font-medium">{order.user?.name || 'Customer'}</p>
                      <p className="text-xs text-[var(--kk-mute)]">{order.user?.email}</p>
                    </td>
                    <td className="px-5 py-4 font-medium sm:px-6">{money(Number(order.total))}</td>
                    <td className="px-5 py-4 sm:px-6">
                      <span
                        className={`inline-flex px-2 py-1 text-[11px] font-bold tracking-wide ${statusTone(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[var(--kk-mute)] sm:px-6">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[var(--kk-mute)] sm:px-6">
                    No orders yet — the floor is quiet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        <Link
          href="/admin/products"
          className="group flex items-center justify-between border border-[var(--kk-ink)] bg-[var(--kk-ink)] px-5 py-4 text-white transition hover:bg-[var(--kk-kick)]"
        >
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5" />
            <div>
              <p className="font-semibold">Stock the catalog</p>
              <p className="text-sm text-white/65 group-hover:text-white/90">
                Add or edit kicks, shirts, watches
              </p>
            </div>
          </div>
          <ArrowUpRight className="h-5 w-5" />
        </Link>
        <Link
          href="/admin/orders"
          className="group flex items-center justify-between border border-[var(--kk-ink)] bg-white px-5 py-4 transition hover:border-[var(--kk-kick)]"
        >
          <div>
            <p className="font-semibold">Move the pipeline</p>
            <p className="text-sm text-[var(--kk-mute)]">PENDING → PAID → SHIPPED → DELIVERED</p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-[var(--kk-kick)]" />
        </Link>
      </div>
    </div>
  );
}
