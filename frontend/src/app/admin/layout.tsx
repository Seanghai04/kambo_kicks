'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  Box,
  Building2,
  CreditCard,
  ExternalLink,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquare,
  RefreshCw,
  Settings,
  ShoppingBag,
  UserRound,
  Users,
  Warehouse,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AdminGuard } from '@/components/Guards';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

type NavItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
  exact?: boolean;
  badge?: number | null;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const TITLE_MAP: Record<string, string> = {
  '/admin': 'Floor Pulse',
  '/admin/orders': 'Sales',
  '/admin/products': 'Catalog',
  '/admin/inventory': 'Inventory',
  '/admin/procurement': 'Procurement',
  '/admin/finance': 'Finance',
  '/admin/delivery': 'Delivery',
  '/admin/reports': 'Reports',
  '/admin/replacements': 'Replacements',
  '/admin/loyalty': 'Loyalty',
  '/admin/contacts': 'Contacts',
  '/admin/messages': 'Messages',
  '/admin/notifications': 'Notifications',
  '/admin/users': 'Users',
  '/admin/settings': 'Settings',
};

function pathActive(pathname: string, href: string, exact = false) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((res) => setPendingOrders(Number(res.data.stats?.pending || 0)))
      .catch(() => setPendingOrders(0));
    api
      .get('/admin/notifications')
      .then((res) => setAlertCount(Number(res.data.count || 0)))
      .catch(() => setAlertCount(0));
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sections: NavSection[] = useMemo(
    () => [
      {
        title: 'Floor',
        items: [
          {
            key: 'dashboard',
            label: 'Dashboard',
            icon: LayoutGrid,
            href: '/admin',
            exact: true,
          },
        ],
      },
      {
        title: 'Commerce',
        items: [
          {
            key: 'sales',
            label: 'Sales',
            icon: ShoppingBag,
            href: '/admin/orders',
            badge: pendingOrders > 0 ? pendingOrders : null,
          },
          { key: 'catalog', label: 'Catalog', icon: Box, href: '/admin/products' },
          { key: 'inventory', label: 'Inventory', icon: Warehouse, href: '/admin/inventory' },
          {
            key: 'procurement',
            label: 'Procurement',
            icon: Building2,
            href: '/admin/procurement',
          },
          { key: 'finance', label: 'Finance', icon: CreditCard, href: '/admin/finance' },
          {
            key: 'delivery',
            label: 'Delivery',
            icon: ArrowLeftRight,
            href: '/admin/delivery',
          },
        ],
      },
      {
        title: 'Ops',
        items: [
          { key: 'reports', label: 'Reports', icon: BarChart3, href: '/admin/reports' },
          {
            key: 'replacements',
            label: 'Replacements',
            icon: RefreshCw,
            href: '/admin/replacements',
          },
          { key: 'loyalty', label: 'Loyalty', icon: Zap, href: '/admin/loyalty' },
          { key: 'contacts', label: 'Contacts', icon: Users, href: '/admin/contacts' },
          { key: 'messages', label: 'Messages', icon: MessageSquare, href: '/admin/messages' },
          {
            key: 'notifications',
            label: 'Notifications',
            icon: Bell,
            href: '/admin/notifications',
            badge: alertCount > 0 ? alertCount : null,
          },
        ],
      },
      {
        title: 'Team',
        items: [
          { key: 'users', label: 'Users', icon: UserRound, href: '/admin/users' },
          { key: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
        ],
      },
    ],
    [pendingOrders, alertCount],
  );

  const pageTitle =
    TITLE_MAP[pathname] ||
    Object.entries(TITLE_MAP).find(([href]) => pathname.startsWith(href) && href !== '/admin')?.[1] ||
    'Admin';

  const sidebar = (
    <aside className="flex h-full w-[250px] flex-col bg-[var(--kk-ink)] text-white">
      <div className="relative overflow-hidden px-5 pb-5 pt-6">
        <span className="absolute -right-6 -top-8 h-24 w-24 rotate-12 bg-[var(--kk-kick)]/90" />
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="relative block transition hover:opacity-90"
          aria-label="Visit store"
        >
          <p className="font-[family-name:var(--font-display)] text-[1.55rem] font-semibold leading-none tracking-[0.04em]">
            KAMBO
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-medium tracking-[0.18em] text-white/75">
            KICKS
          </p>
        </Link>
        <p className="relative mt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--kk-kick)]">
          Floor Console
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 pt-2">
        {sections.map((section) => (
          <div key={section.title} className="mb-5">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathActive(pathname, item.href, item.exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    {active && (
                      <span className="absolute inset-y-0 left-0 w-[3px] bg-[var(--kk-kick)]" />
                    )}
                    <Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.7} />
                    <span className="truncate">{item.label}</span>
                    {item.badge != null && (
                      <span className="ml-auto inline-flex min-w-5 items-center justify-center bg-[var(--kk-kick)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 px-1 py-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[var(--kk-kick)] text-sm font-bold text-white">
            {(user?.name || 'A').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.name || 'Admin'}</p>
            <p className="truncate text-xs text-white/45">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="p-2 text-white/45 transition hover:text-white"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <AdminGuard>
      <div className="kk-admin flex min-h-screen">
        <div className="hidden lg:block">{sidebar}</div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative z-10 h-full">{sidebar}</div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-[4.25rem] items-center gap-3 border-b border-[var(--kk-line)] bg-[var(--kk-chalk)]/90 px-4 backdrop-blur sm:px-6">
            <button
              type="button"
              className="p-2 text-[var(--kk-slate)] hover:bg-black/5 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--kk-mute)]">
                Kambo · Floor
              </p>
              <h1 className="truncate font-[family-name:var(--font-display)] text-2xl font-semibold leading-none tracking-tight">
                {pageTitle}
              </h1>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 border border-[var(--kk-line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--kk-slate)] transition hover:border-[var(--kk-ink)]"
              >
                Visit store
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>

              <Link
                href="/admin/notifications"
                className="relative p-2 text-[var(--kk-slate)] hover:bg-black/5"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {alertCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center bg-[var(--kk-kick)] px-1 text-[9px] font-bold text-white">
                    {alertCount > 9 ? '9+' : alertCount}
                  </span>
                )}
              </Link>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
