import { User } from 'firebase/auth';
import { serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { APP_ID, userDirectoryDoc } from '@/lib/firestorePaths';

export async function ensureUserAppRegistration(user: User) {
  await setDoc(
    userDirectoryDoc(db, user.uid),
    {
      uid: user.uid,
      email: user.email ?? null,
      display_name: user.displayName ?? null,
      apps: {
        [APP_ID]: true,
      },
      updated_at: serverTimestamp(),
    },
    { merge: true }
  );
}
