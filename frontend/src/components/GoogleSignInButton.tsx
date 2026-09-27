'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: number;
            },
          ) => void;
        };
      };
    };
  }
}

type GoogleSignInButtonProps = {
  onCredential: (idToken: string) => Promise<void> | void;
  onError?: (message: string) => void;
  label?: 'signin_with' | 'signup_with' | 'continue_with';
  fullWidth?: boolean;
  shape?: 'rectangular' | 'pill';
};

const SCRIPT_ID = 'google-gsi-client';

export default function GoogleSignInButton({
  onCredential,
  onError,
  label = 'continue_with',
  fullWidth = false,
  shape = 'rectangular',
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;

    function initButton() {
      if (cancelled || !buttonRef.current || !window.google?.accounts?.id) return;

      const width = fullWidth
        ? Math.min(Math.max(buttonRef.current.clientWidth || 360, 280), 400)
        : 320;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            await onCredential(response.credential);
          } catch (err) {
            onError?.(err instanceof Error ? err.message : 'Google sign-in failed');
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      buttonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        text: label,
        shape,
        width,
      });
      setReady(true);
    }

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (window.google?.accounts?.id) initButton();
      else existing.addEventListener('load', initButton);
      return () => {
        cancelled = true;
      };
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initButton;
    script.onerror = () => onError?.('Could not load Google sign-in');
    document.body.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [clientId, label, onCredential, onError, fullWidth, shape]);

  if (!clientId) {
    return (
      <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Google login is not configured yet. Add{' '}
        <code className="font-mono">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to your frontend env.
      </p>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${fullWidth ? 'w-full' : ''}`}>
      <div
        ref={buttonRef}
        className={`flex min-h-[44px] justify-center ${fullWidth ? 'w-full' : ''}`}
      />
      {!ready && <p className="text-xs text-gray-400">Loading Google…</p>}
    </div>
  );
}
