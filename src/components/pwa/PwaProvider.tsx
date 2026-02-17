'use client';

import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type InstallChoice = {
  outcome: 'accepted' | 'dismissed';
  platform: string;
};

export type InstallPromptResult = 'accepted' | 'dismissed' | 'unavailable';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
}

export type PwaInstallContextValue = {
  isInstalled: boolean;
  canPromptInstall: boolean;
  isIosManualInstallAvailable: boolean;
  showBanner: boolean;
  promptInstall: () => Promise<InstallPromptResult>;
  dismissBanner: () => void;
};

export const PwaInstallContext = createContext<PwaInstallContextValue | undefined>(undefined);

const DISMISS_STORAGE_KEY = 'klaudpad:pwa-banner-dismissed-until';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function isStandaloneMode() {
  if (typeof window === 'undefined') return false;

  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}

function isIosManualInstallSupported() {
  if (typeof window === 'undefined') return false;

  const ua = window.navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios|opr\//i.test(ua);

  return isIOS && isSafari && !isStandaloneMode();
}

function getDismissedUntil() {
  if (typeof window === 'undefined') return 0;

  const stored = window.localStorage.getItem(DISMISS_STORAGE_KEY);
  const parsed = stored ? Number.parseInt(stored, 10) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canPromptInstall, setCanPromptInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIosManualInstallAvailable, setIsIosManualInstallAvailable] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const dismissTimerRef = useRef<number | null>(null);

  const applyDismissState = useCallback((until: number) => {
    if (dismissTimerRef.current) {
      window.clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }

    const now = Date.now();
    if (until <= now) {
      setIsBannerDismissed(false);
      window.localStorage.removeItem(DISMISS_STORAGE_KEY);
      return;
    }

    setIsBannerDismissed(true);
    dismissTimerRef.current = window.setTimeout(() => {
      setIsBannerDismissed(false);
      dismissTimerRef.current = null;
      window.localStorage.removeItem(DISMISS_STORAGE_KEY);
    }, until - now);
  }, []);

  useEffect(() => {
    const hydrationTimeout = window.setTimeout(() => {
      setIsInstalled(isStandaloneMode());
      setIsIosManualInstallAvailable(isIosManualInstallSupported());
      applyDismissState(getDismissedUntil());
    }, 0);

    const media = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => {
      const installed = isStandaloneMode();
      setIsInstalled(installed);
      if (installed) {
        setCanPromptInstall(false);
        setDeferredPrompt(null);
      }
      setIsIosManualInstallAvailable(isIosManualInstallSupported());
    };

    media.addEventListener('change', handleDisplayModeChange);
    window.addEventListener('appinstalled', handleDisplayModeChange);

    return () => {
      window.clearTimeout(hydrationTimeout);
      media.removeEventListener('change', handleDisplayModeChange);
      window.removeEventListener('appinstalled', handleDisplayModeChange);
      if (dismissTimerRef.current) {
        window.clearTimeout(dismissTimerRef.current);
      }
    };
  }, [applyDismissState]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();

      setDeferredPrompt(installEvent);
      setCanPromptInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service worker registration failed:', error);
    });
  }, []);

  const dismissBanner = useCallback(() => {
    const until = Date.now() + DISMISS_DURATION_MS;
    window.localStorage.setItem(DISMISS_STORAGE_KEY, String(until));
    applyDismissState(until);
  }, [applyDismissState]);

  const promptInstall = useCallback(async (): Promise<InstallPromptResult> => {
    if (!deferredPrompt || isInstalled) {
      return 'unavailable';
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      setDeferredPrompt(null);
      setCanPromptInstall(false);

      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        return 'accepted';
      }

      return 'dismissed';
    } catch {
      return 'unavailable';
    }
  }, [deferredPrompt, isInstalled]);

  const showBanner = useMemo(() => {
    if (isInstalled) return false;
    if (!(canPromptInstall || isIosManualInstallAvailable)) return false;
    return !isBannerDismissed;
  }, [canPromptInstall, isInstalled, isIosManualInstallAvailable, isBannerDismissed]);

  const value = useMemo<PwaInstallContextValue>(() => {
    return {
      isInstalled,
      canPromptInstall,
      isIosManualInstallAvailable,
      showBanner,
      promptInstall,
      dismissBanner,
    };
  }, [canPromptInstall, dismissBanner, isInstalled, isIosManualInstallAvailable, promptInstall, showBanner]);

  return <PwaInstallContext.Provider value={value}>{children}</PwaInstallContext.Provider>;
}
