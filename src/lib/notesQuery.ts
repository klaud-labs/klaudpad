import { getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { appNotesCollection } from '@/lib/firestorePaths';
import { db } from '@/lib/firebase';

async function findLatestByOrder({
  ownerUid,
  orderField,
  excludeNoteId,
}: {
  ownerUid: string;
  orderField: 'updatedAt' | 'updated_at';
  excludeNoteId?: string;
}): Promise<string | null> {
  try {
    const queryLimit = excludeNoteId ? 2 : 1;
    const q = query(
      appNotesCollection(db),
      where('ownerUid', '==', ownerUid),
      orderBy(orderField, 'desc'),
      limit(queryLimit)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const candidate = snapshot.docs.find((doc) => doc.id !== excludeNoteId);
    return candidate ? candidate.id : null;
  } catch {
    return null;
  }
}

export async function getLatestUserNoteId(
  userId: string,
  options: { excludeNoteId?: string } = {}
): Promise<string | null> {
  const { excludeNoteId } = options;

  const ownerUidByUpdatedAt = await findLatestByOrder({
    ownerUid: userId,
    orderField: 'updatedAt',
    excludeNoteId,
  });
  if (ownerUidByUpdatedAt) return ownerUidByUpdatedAt;

  return findLatestByOrder({
    ownerUid: userId,
    orderField: 'updated_at',
    excludeNoteId,
  });
}
