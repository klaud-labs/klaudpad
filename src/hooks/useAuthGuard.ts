'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ensureUserAppRegistration } from '@/lib/userRegistration';

export function useAuthGuard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(() => auth.currentUser);
  const [loading, setLoading] = useState(() => !auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        router.replace('/login');
        return;
      }

      setUser(currentUser);
      setLoading(false);

      void ensureUserAppRegistration(currentUser).catch((error) => {
        console.error('Failed to ensure user app registration:', error);
      });
    });

    return () => unsubscribe();
  }, [router]);

  return { user, loading };
}
