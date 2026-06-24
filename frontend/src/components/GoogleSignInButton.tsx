"use client";

import { useCallback, useEffect, useRef, useState } from 'react';

type GoogleCredentialResponse = {
  credential: string;
};

type GoogleSignInButtonProps = {
  onSuccess: (credential: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string | number | boolean>
          ) => void;
        };
      };
    };
  }
}

const loadingButtonClass =
  'w-full py-2.5 sm:py-3 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-500';

export default function GoogleSignInButton({ onSuccess, onError, disabled }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  const handleCredential = useCallback((response: GoogleCredentialResponse) => {
    if (response.credential) {
      onSuccess(response.credential);
    } else {
      onError?.('Không nhận được thông tin từ Google');
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    setMounted(true);
    setClientId(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? null);
  }, []);

  useEffect(() => {
    if (!mounted || !clientId) return;

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
      });

      buttonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        width: buttonRef.current.offsetWidth || 320,
      });
      setReady(true);
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-gsi="true"]');
    if (existingScript) {
      existingScript.addEventListener('load', initializeGoogle);
      return () => existingScript.removeEventListener('load', initializeGoogle);
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleGsi = 'true';
    script.onload = initializeGoogle;
    script.onerror = () => onError?.('Không thể tải Google Sign-In');
    document.body.appendChild(script);

    return () => {
      script.removeEventListener('load', initializeGoogle);
    };
  }, [mounted, clientId, handleCredential, onError]);

  if (!mounted) {
    return (
      <button type="button" disabled className={loadingButtonClass}>
        Đang tải Google Sign-In...
      </button>
    );
  }

  if (!clientId) {
    return (
      <p className="text-xs text-center text-slate-500 dark:text-slate-400">
        Thêm <code className="font-mono">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> vào file .env để bật đăng nhập Google.
      </p>
    );
  }

  return (
    <div className={disabled ? 'pointer-events-none opacity-50' : ''}>
      {!ready && (
        <button type="button" disabled className={loadingButtonClass}>
          Đang tải Google Sign-In...
        </button>
      )}
      <div ref={buttonRef} className={`flex justify-center min-h-[44px] w-full ${ready ? '' : 'hidden'}`} />
    </div>
  );
}
