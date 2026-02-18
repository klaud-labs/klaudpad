'use client';

import { useCallback, useMemo, useState } from 'react';
import type { DragEvent } from 'react';

type DraggableNote = {
  id: string;
  folder_id: string | null;
};

type UseNotesDragDropArgs<TNote extends DraggableNote> = {
  notes: TNote[];
  moveNoteToFolder: (noteId: string, folderId: string | null) => Promise<void>;
  createFolderFromUnsortedPair: (sourceId: string, targetId: string) => Promise<void>;
};

export function useNotesDragDrop<TNote extends DraggableNote>({
  notes,
  moveNoteToFolder,
  createFolderFromUnsortedPair,
}: UseNotesDragDropArgs<TNote>) {
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [dragOverUnsorted, setDragOverUnsorted] = useState(false);

  const notesById = useMemo(() => {
    const map = new Map<string, TNote>();
    notes.forEach((note) => map.set(note.id, note));
    return map;
  }, [notes]);

  const resolveDraggedId = useCallback((event: DragEvent<HTMLElement>) => {
    const transferId = event.dataTransfer.getData('text/plain').trim();
    if (transferId) return transferId;
    return draggedNoteId;
  }, [draggedNoteId]);

  const resetDragState = useCallback(() => {
    setDraggedNoteId(null);
    setDragOverFolderId(null);
    setDragOverUnsorted(false);
  }, []);

  const handleNoteDragStart = useCallback((event: DragEvent<HTMLElement>, noteId: string) => {
    setDraggedNoteId(noteId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', noteId);
  }, []);

  const handleNoteDragEnd = useCallback(() => {
    resetDragState();
  }, [resetDragState]);

  const handleDropOnNote = useCallback(async (event: DragEvent<HTMLElement>, targetNote: TNote) => {
    event.preventDefault();
    event.stopPropagation();
    const sourceId = resolveDraggedId(event);
    resetDragState();

    if (!sourceId || sourceId === targetNote.id) return;
    const sourceNote = notesById.get(sourceId);
    if (!sourceNote) return;

    if (!sourceNote.folder_id && !targetNote.folder_id) {
      await createFolderFromUnsortedPair(sourceNote.id, targetNote.id);
      return;
    }

    if (targetNote.folder_id && sourceNote.folder_id !== targetNote.folder_id) {
      await moveNoteToFolder(sourceNote.id, targetNote.folder_id);
    }
  }, [createFolderFromUnsortedPair, moveNoteToFolder, notesById, resetDragState, resolveDraggedId]);

  const handleDropOnFolder = useCallback(async (event: DragEvent<HTMLElement>, folderId: string) => {
    event.preventDefault();
    event.stopPropagation();
    const sourceId = resolveDraggedId(event);
    resetDragState();

    if (!sourceId) return;
    const sourceNote = notesById.get(sourceId);
    if (!sourceNote || sourceNote.folder_id === folderId) return;

    await moveNoteToFolder(sourceId, folderId);
  }, [moveNoteToFolder, notesById, resetDragState, resolveDraggedId]);

  const handleDropOnUnsorted = useCallback(async (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const sourceId = resolveDraggedId(event);
    resetDragState();

    if (!sourceId) return;
    const sourceNote = notesById.get(sourceId);
    if (!sourceNote || !sourceNote.folder_id) return;

    await moveNoteToFolder(sourceId, null);
  }, [moveNoteToFolder, notesById, resetDragState, resolveDraggedId]);

  const handleUnsortedDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDragOverUnsorted(true);
  }, []);

  const handleUnsortedDragLeave = useCallback(() => {
    setDragOverUnsorted(false);
  }, []);

  const handleFolderDragOver = useCallback((event: DragEvent<HTMLElement>, folderId: string) => {
    event.preventDefault();
    setDragOverFolderId(folderId);
  }, []);

  const handleFolderDragLeave = useCallback((folderId: string) => {
    setDragOverFolderId((current) => (current === folderId ? null : current));
  }, []);

  return {
    dragOverFolderId,
    dragOverUnsorted,
    handleDropOnFolder,
    handleDropOnNote,
    handleDropOnUnsorted,
    handleFolderDragLeave,
    handleFolderDragOver,
    handleNoteDragEnd,
    handleNoteDragStart,
    handleUnsortedDragLeave,
    handleUnsortedDragOver,
  };
}
