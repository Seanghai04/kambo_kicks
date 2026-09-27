'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function AuthGuardInner({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (loading || user) return;
    const current = `${pathname}${searchParams.toString() ? `?${searchParams}` : ''}`;
    router.push(`/login?next=${encodeURIComponent(current)}`);
  }, [user, loading, router, pathname, searchParams]);

  if (loading) {
    return <div className="py-20 text-center text-gray-500">Loading…</div>;
  }

  if (!user) return null;

  return <>{children}</>;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-500">Loading…</div>}>
      <AuthGuardInner>{children}</AuthGuardInner>
    </Suspense>
  );
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user && user.role !== 'ADMIN') router.push('/');
  }, [user, loading, router]);

  if (loading) {
    return <div className="py-20 text-center text-gray-500">Loading…</div>;
  }

  if (!user || user.role !== 'ADMIN') return null;

  return <>{children}</>;
}
