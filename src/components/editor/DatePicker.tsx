'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';

interface DatePickerProps {
  onSelect: (date: Date) => void;
  onClose: () => void;
}

export const DatePicker = ({ onSelect, onClose }: DatePickerProps) => {
  const today = useMemo(() => new Date(), []);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const headingId = useId();
  const helperTextId = useId();
  const [viewDate, setViewDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(viewDate);
  const fullDateFormatter = useMemo(
    () => new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    [],
  );

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onClose();
    };

    const previousOverflow = document.body.style.overflow;
    const frame = window.requestAnimationFrame(() => {
      cancelButtonRef.current?.focus();
    });

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const days: Array<Date | null> = [];
  for (let i = 0; i < firstDayOfMonth; i += 1) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i += 1) {
    days.push(new Date(year, month, i));
  }

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={helperTextId}
        className="w-full max-w-[320px] rounded-[var(--rLg)] border tulis-border bg-[color:var(--surface)] shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Go to previous month"
              className="rounded-xl p-2 tulis-text transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="text-center">
              <h3 id={headingId} className="font-black tracking-tight tulis-text">
                {monthName}
              </h3>
              <p className="text-[11px] font-bold uppercase tracking-wider tulis-muted opacity-60" aria-live="polite">
                {year}
              </p>
            </div>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Go to next month"
              className="rounded-xl p-2 tulis-text transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <p id={helperTextId} className="sr-only">
            Choose a date and press enter to insert it.
          </p>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <div key={`${day}-${index}`} className="py-2 text-center text-[10px] font-black uppercase tulis-muted opacity-45">
                {day.slice(0, 1)}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) return <div key={`blank-${index}`} />;

              const isToday = today.toDateString() === date.toDateString();
              const isSelected = selectedDate?.toDateString() === date.toDateString();

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => {
                    setSelectedDate(date);
                    onSelect(date);
                  }}
                  aria-label={fullDateFormatter.format(date)}
                  aria-pressed={isSelected}
                  className={`aspect-square rounded-xl text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-[color:var(--tulis-accent)] text-white'
                      : isToday
                        ? 'bg-[color:var(--tulis-accent)]/10 text-[color:var(--tulis-accent)]'
                        : 'tulis-text hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t tulis-border p-4">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-bold tulis-muted transition-colors hover:text-[color:var(--text)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSelect(today)}
            className="rounded-lg px-4 py-2 text-xs font-bold text-[color:var(--tulis-accent)] transition-colors hover:bg-[color:var(--tulis-accent)]/5"
          >
            Today
          </button>
        </div>
      </div>
    </div>
  );
};
