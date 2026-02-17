'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { usePwaInstall } from '@/hooks/usePwaInstall';

function useMobileLayout() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px), (pointer: coarse)');
    const sync = () => setIsMobile(media.matches);

    sync();
    media.addEventListener('change', sync);

    return () => {
      media.removeEventListener('change', sync);
    };
  }, []);

  return isMobile;
}

export function MobileInstallBanner() {
  const pathname = usePathname();
  const isMobile = useMobileLayout();
  const {
    canPromptInstall,
    dismissBanner,
    isIosManualInstallAvailable,
    showBanner,
    promptInstall,
  } = usePwaInstall();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const shouldRender = useMemo(() => {
    if (!showBanner) return false;
    if (!isMobile) return false;
    if (!pathname?.startsWith('/notes')) return false;
    return true;
  }, [isMobile, pathname, showBanner]);

  if (!shouldRender) return null;

  const isIosManual = !canPromptInstall && isIosManualInstallAvailable;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[80] sm:inset-x-6 sm:bottom-5">
      <div className="rounded-2xl border klaud-border bg-[color:var(--klaud-glass)]/95 p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[color:var(--klaud-accent)]">
              Install KlaudPad
            </p>
            <p className="mt-1 text-sm font-medium klaud-text">
              {isIosManual
                ? 'Open Share and choose Add to Home Screen for app-like access.'
                : 'Install on your home screen for quick launches and smoother loading.'}
            </p>
          </div>
          <button
            type="button"
            onClick={dismissBanner}
            className="rounded-lg p-1.5 text-[color:var(--klaud-muted)] hover:text-[color:var(--klaud-accent)]"
            aria-label="Dismiss install banner"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.25" viewBox="0 0 24 24">
              <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
              <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {canPromptInstall ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={async () => {
                setIsSubmitting(true);
                const result = await promptInstall();
                setIsSubmitting(false);

                if (result !== 'accepted') {
                  dismissBanner();
                }
              }}
              className="rounded-xl bg-gradient-to-r from-[color:var(--klaud-accent)] to-[color:var(--klaud-secondary)] px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-cyan-500/20 disabled:opacity-60"
            >
              {isSubmitting ? 'Opening...' : 'Install App'}
            </button>
          ) : (
            <button
              type="button"
              onClick={dismissBanner}
              className="rounded-xl bg-[color:var(--klaud-surface)] px-3.5 py-2 text-xs font-bold uppercase tracking-wide klaud-text ring-1 ring-[color:var(--klaud-border)]"
            >
              Got it
            </button>
          )}

          <button
            type="button"
            onClick={dismissBanner}
            className="rounded-xl bg-transparent px-3 py-2 text-xs font-bold uppercase tracking-wide klaud-muted"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
