'use client';

export function LoadingNotesScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center tulis-bg">
      <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-[color:var(--border2)] border-t-[color:var(--accent)]"
          aria-hidden="true"
        />
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] tulis-muted">Loading notes...</p>
      </div>
    </div>
  );
}
