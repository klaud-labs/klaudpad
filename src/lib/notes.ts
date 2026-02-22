const TAG_PATTERN = /^[a-z0-9_-]+$/;

export type SearchFilters = {
  normalizedText: string;
  tagFromQuery: string | null;
  pinnedOnly: boolean;
};

export type SearchableNote = {
  title?: string | null;
  content?: string | null;
  tags?: string[] | null;
  pinned?: boolean | null;
};

export const normalizeTag = (value: string): string | null => {
  const trimmed = value
    .trim()
    .toLowerCase()
    .replace(/^#+/, '')
    .replace(/[\s/]+/g, '-')
    .replace(/-+/g, '-');
  if (!trimmed) return null;
  if (trimmed.length > 24) return null;
  if (!TAG_PATTERN.test(trimmed)) return null;
  return trimmed;
};

export const normalizeTags = (values: string[]): string[] => {
  const deduped = new Set<string>();

  values.forEach((value) => {
    const normalized = normalizeTag(value);
    if (!normalized) return;
    if (deduped.size >= 10) return;
    deduped.add(normalized);
  });

  return [...deduped];
};

export const parseSearchFilters = (query: string): SearchFilters => {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let pinnedOnly = false;
  let tagFromQuery: string | null = null;
  const textParts: string[] = [];

  tokens.forEach((token) => {
    if (token === 'is:pinned') {
      pinnedOnly = true;
      return;
    }

    if (token.startsWith('#')) {
      const normalized = normalizeTag(token);
      if (normalized) {
        tagFromQuery = normalized;
      }
      return;
    }

    textParts.push(token);
  });

  return {
    normalizedText: textParts.join(' '),
    tagFromQuery,
    pinnedOnly,
  };
};

export const matchesNoteSearch = (note: SearchableNote, filters: SearchFilters): boolean => {
  const title = (note.title || '').toLowerCase();
  const content = (note.content || '').toLowerCase();
  const tags = (note.tags || []).map((tag) => tag.toLowerCase());

  if (filters.pinnedOnly && !note.pinned) {
    return false;
  }

  if (filters.tagFromQuery && !tags.includes(filters.tagFromQuery)) {
    return false;
  }

  if (!filters.normalizedText) {
    return true;
  }

  const haystack = `${title}\n${content}\n${tags.join(' ')}`;
  return haystack.includes(filters.normalizedText);
};

export const notePreview = (content: string | null | undefined): string => {
  const normalized = (content || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!normalized) return 'No content yet';
  return normalized;
};
