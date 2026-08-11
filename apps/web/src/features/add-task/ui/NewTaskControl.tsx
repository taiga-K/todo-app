import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';

export type NewTaskPayload = {
  title: string;
  details: string;
  time: string;
};

type NewTaskControlProps = {
  onAdd: (input: NewTaskPayload) => void;
  disabled?: boolean;
};

export function NewTaskControl({ onAdd, disabled = false }: NewTaskControlProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [time, setTime] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  function closeComposer() {
    setOpen(false);
    setTitle('');
    setDetails('');
    setTime('');
  }

  function submit() {
    const trimmed = title.trim();
    if (!trimmed || disabled) return;
    onAdd({
      title: trimmed,
      details: details.trim(),
      time,
    });
    closeComposer();
  }

  useEffect(() => {
    if (open) titleRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        if (!disabled) setOpen(true);
      }
      if (event.key === 'Escape' && open) closeComposer();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, disabled]);

  if (!open) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-lg bg-[#f3f3f6] px-3 py-2.5 text-left text-[14px] text-[#8b8b96] transition-colors hover:bg-[#ececf1] disabled:opacity-50"
      >
        <Plus className="size-4" strokeWidth={2} />
        タスクを追加
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-[rgba(55,53,47,0.12)] bg-white px-3 py-3">
      <input
        ref={titleRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="タイトル"
        className="w-full bg-transparent text-[15px] font-medium text-[var(--ink)] outline-none placeholder:text-[#8b8b96]"
        aria-label="タイトル"
      />
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="概要"
        rows={2}
        className="mt-2 w-full resize-none bg-transparent text-[13px] leading-relaxed text-[var(--ink-soft)] outline-none placeholder:text-[#8b8b96]"
        aria-label="概要"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-[13px] text-[var(--ink-soft)]">
          <span>時間</span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-md border border-[rgba(55,53,47,0.12)] bg-transparent px-2 py-1 text-[13px] outline-none"
          />
        </label>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={closeComposer}
            className="rounded-md px-3 py-1.5 text-[13px] text-[#8b8b96] hover:bg-[#f3f3f6]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!title.trim() || disabled}
            className="rounded-md bg-[var(--ink)] px-3 py-1.5 text-[13px] font-medium text-white disabled:opacity-35"
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
}
