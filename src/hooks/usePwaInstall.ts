'use client';

import { useContext } from 'react';
import { PwaInstallContext } from '@/components/pwa/PwaProvider';

export function usePwaInstall() {
  const context = useContext(PwaInstallContext);

  if (!context) {
    throw new Error('usePwaInstall must be used within a PwaProvider.');
  }

  return context;
}
