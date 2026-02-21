import { addDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { appNoteDoc, appNotesCollection } from '@/lib/firestorePaths';
import { getLatestUserNoteId } from '@/lib/notesQuery';

export type EnsureUserNoteResult = {
  noteId: string;
  created: boolean;
};

const ensureInFlight = new Map<string, Promise<EnsureUserNoteResult>>();

async function isUserAccessibleNoteId(userId: string, noteId: string): Promise<boolean> {
  try {
    const snapshot = await getDoc(appNoteDoc(db, noteId));
    if (!snapshot.exists()) return false;
    const data = snapshot.data();
    return data.ownerUid === userId && data.is_deleted !== true;
  } catch {
    return false;
  }
}

export async function createEmptyNoteForUser(userId: string): Promise<string> {
  const timestamp = serverTimestamp();
  const created = await addDoc(appNotesCollection(db), {
    ownerUid: userId,
    owner: userId,
    title: 'Untitled',
    content: '',
    content_json: { type: 'doc', content: [] },
    tags: [],
    pinned: false,
    is_deleted: false,
    deleted_at: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    created_at: timestamp,
    updated_at: timestamp,
  });

  return created.id;
}

export async function ensureUserHasNote(
  userId: string,
  options: { excludeNoteId?: string; preferredNoteId?: string } = {}
): Promise<EnsureUserNoteResult> {
  const { excludeNoteId, preferredNoteId } = options;
  const existingInFlight = ensureInFlight.get(userId);
  if (existingInFlight) {
    const result = await existingInFlight;
    if (!excludeNoteId || result.noteId !== excludeNoteId) {
      return result;
    }
  }

  const ensurePromise = (async () => {
    if (preferredNoteId && preferredNoteId !== excludeNoteId) {
      const preferredIsAccessible = await isUserAccessibleNoteId(userId, preferredNoteId);
      if (preferredIsAccessible) {
        return { noteId: preferredNoteId, created: false };
      }
    }

    const latestNoteId = await getLatestUserNoteId(userId, { excludeNoteId });
    if (latestNoteId) {
      return { noteId: latestNoteId, created: false };
    }

    const createdNoteId = await createEmptyNoteForUser(userId);
    return { noteId: createdNoteId, created: true };
  })();

  ensureInFlight.set(userId, ensurePromise);

  try {
    return await ensurePromise;
  } finally {
    if (ensureInFlight.get(userId) === ensurePromise) {
      ensureInFlight.delete(userId);
    }
  }
}
