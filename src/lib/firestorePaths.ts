import { collection, doc, Firestore } from 'firebase/firestore';

export const APP_ID = 'tulis';

const APP_ROOT_DOC = 'data';
const NOTES_COLLECTION = 'notes';

export function appNotesCollection(db: Firestore) {
  return collection(db, APP_ID, APP_ROOT_DOC, NOTES_COLLECTION);
}

export function appNoteDoc(db: Firestore, noteId: string) {
  return doc(appNotesCollection(db), noteId);
}

export function userDirectoryDoc(db: Firestore, userId: string) {
  return doc(db, 'users', userId);
}
