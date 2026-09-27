'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/lib/errors';
import GoogleSignInButton from '@/components/GoogleSignInButton';

type Mode = 'login' | 'register';

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/products';
  return raw;
}

export default function AuthForms({ mode = 'login' }: { mode?: Mode }) {
  const { login, register, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get('next'));
  const isLogin = mode === 'login';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onGoogle = useCallback(
    async (idToken: string) => {
      setError('');
      setLoading(true);
      try {
        await loginWithGoogle(idToken);
        router.push(nextPath);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Google sign-in failed'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loginWithGoogle, nextPath, router],
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      if (!remember) {
        // Token still stored for session UX; remember is UI preference for now
      }
      router.push(nextPath);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          isLogin ? 'Wrong email or password' : 'Registration failed. Email may already exist.',
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-4 py-10 sm:py-14">
      {/* Brand stage background — ink + kick, not the mockup red */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 20%, rgba(255,92,46,0.35), transparent 55%),
            radial-gradient(ellipse 70% 55% at 90% 80%, rgba(18,20,23,0.55), transparent 50%),
            linear-gradient(145deg, #1a1d22 0%, #121417 45%, #2a1814 100%)
          `,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(255,92,46,0.2), transparent 35%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.06), transparent 40%)',
        }}
      />

      <div className="relative z-10 w-full max-w-[980px]">
        <div className="mb-5 text-center sm:mb-6">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-[0.16em] text-white sm:text-2xl"
          >
            KAMBO-KICKS
          </Link>
        </div>

        <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div className="grid lg:grid-cols-2">
            {/* Left: form */}
            <div className="flex flex-col justify-center px-7 py-9 sm:px-10 sm:py-11 lg:px-12">
              <h1
                className="text-[1.65rem] font-extrabold uppercase tracking-tight sm:text-[1.85rem]"
                style={{ color: 'var(--kk-ink)' }}
              >
                {isLogin ? 'Welcome back' : 'Join the floor'}
              </h1>
              <p className="mt-2 text-sm" style={{ color: 'var(--kk-mute)' }}>
                {isLogin
                  ? 'Welcome back! Please enter your details.'
                  : 'Create your KAMBO-KICKS account to start shopping.'}
              </p>

              <form onSubmit={onSubmit} className="mt-7 space-y-4">
                {!isLogin && (
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--kk-ink)' }}>
                      Name
                    </span>
                    <input
                      className="auth-field"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </label>
                )}

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--kk-ink)' }}>
                    Email
                  </span>
                  <input
                    className="auth-field"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--kk-ink)' }}>
                    Password
                  </span>
                  <input
                    className="auth-field"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    minLength={isLogin ? undefined : 6}
                  />
                </label>

                {!isLogin && (
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--kk-ink)' }}>
                      Confirm password
                    </span>
                    <input
                      className="auth-field"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      minLength={6}
                    />
                  </label>
                )}

                {isLogin && (
                  <div className="flex items-center justify-between gap-3 pt-0.5 text-sm">
                    <label className="inline-flex cursor-pointer items-center gap-2" style={{ color: 'var(--kk-slate)' }}>
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="h-4 w-4 rounded border-[var(--kk-line)] accent-[var(--kk-kick)]"
                      />
                      Remember me
                    </label>
                    <span className="cursor-default text-[var(--kk-mute)]" title="Coming soon">
                      Forgot password
                    </span>
                  </div>
                )}

                {error && (
                  <p
                    className="rounded-lg px-3 py-2 text-sm"
                    style={{ background: 'var(--kk-kick-soft)', color: 'var(--kk-kick)' }}
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl py-3 text-[15px] font-semibold text-white transition hover:opacity-90 disabled:opacity-45"
                  style={{ background: 'var(--kk-kick)' }}
                >
                  {loading
                    ? isLogin
                      ? 'Signing in…'
                      : 'Creating…'
                    : isLogin
                      ? 'Sign in'
                      : 'Create account'}
                </button>
              </form>

              <div className="mt-3">
                <div
                  className="flex min-h-[46px] items-center justify-center rounded-xl border bg-white px-2 py-1.5"
                  style={{ borderColor: 'var(--kk-line)' }}
                >
                  <GoogleSignInButton
                    onCredential={onGoogle}
                    onError={(message) => setError(message)}
                    label={isLogin ? 'signin_with' : 'signup_with'}
                    fullWidth
                    shape="rectangular"
                  />
                </div>
              </div>

              <p className="mt-6 text-center text-sm" style={{ color: 'var(--kk-mute)' }}>
                {isLogin ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="font-semibold" style={{ color: 'var(--kk-kick)' }}>
                      Sign up for free!
                    </Link>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold" style={{ color: 'var(--kk-kick)' }}>
                      Sign in
                    </Link>
                  </>
                )}
              </p>
            </div>

            {/* Right: illustration */}
            <div
              className="relative hidden min-h-[520px] items-end justify-center overflow-hidden lg:flex"
              style={{ background: 'linear-gradient(180deg, #f7f7f9 0%, #eceef2 55%, #e4e6eb 100%)' }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 30% 40%, rgba(255,92,46,0.12), transparent 40%), radial-gradient(circle at 70% 70%, rgba(18,20,23,0.06), transparent 45%)',
                }}
              />
              <Image
                src="/auth/athlete.png"
                alt="KAMBO-KICKS athlete"
                width={520}
                height={640}
                className="relative z-10 h-full w-auto max-w-none object-contain object-bottom drop-shadow-[0_12px_30px_rgba(18,20,23,0.18)]"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
