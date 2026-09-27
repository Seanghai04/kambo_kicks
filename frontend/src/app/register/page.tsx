'use client';

import { Suspense } from 'react';
import AuthForms from '@/components/AuthForms';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-500">Loading…</div>}>
      <AuthForms mode="register" />
    </Suspense>
  );
}
