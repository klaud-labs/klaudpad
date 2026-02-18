type TimestampLike = {
  toMillis?: () => number;
} | null;

type FolderLike = {
  name: string;
  created_at: TimestampLike;
};

export const normalizeFolderId = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

export const normalizeFolderName = (value: unknown): string => {
  if (typeof value !== 'string') return 'New Folder';
  const trimmed = value.trim();
  return trimmed || 'New Folder';
};

export const sortFoldersByCreatedAt = <T extends FolderLike>(folders: T[]): T[] => {
  return [...folders].sort((a, b) => {
    const aMillis = a.created_at?.toMillis?.() ?? 0;
    const bMillis = b.created_at?.toMillis?.() ?? 0;
    if (aMillis === bMillis) {
      return a.name.localeCompare(b.name);
    }
    return aMillis - bMillis;
  });
};

export const matchesNoteQuery = (title: string | null | undefined, query: string): boolean => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  return (title || 'Untitled').toLowerCase().includes(normalizedQuery);
};
