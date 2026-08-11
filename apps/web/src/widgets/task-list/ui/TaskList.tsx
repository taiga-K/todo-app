import { Clock3 } from 'lucide-react';
import type { Task } from '@/entities/task';
import { NewTaskControl, type NewTaskPayload } from '@/features/add-task';
import { SquareCheck } from '@/shared/ui/SquareCheck';

type TaskListProps = {
  tasks: Task[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onToggleDone: (task: Task) => void;
  onAdd: (input: NewTaskPayload) => void;
  busy?: boolean;
};

export function TaskList({
  tasks,
  selectedId,
  onSelect,
  onToggleDone,
  onAdd,
  busy = false,
}: TaskListProps) {
  const openTasks = tasks.filter((task) => !task.done);

  return (
    <section className="flex h-full w-[min(100%,420px)] shrink-0 flex-col border-r border-[rgba(55,53,47,0.08)] bg-white px-4 pt-8 pb-6">
      <h1 className="mb-4 text-[28px] font-semibold tracking-[-0.03em] text-[var(--ink)]">Today</h1>

      <NewTaskControl onAdd={onAdd} disabled={busy} />

      <div className="mt-5 mb-2 flex items-baseline gap-2 px-1">
        <span className="text-[14px] font-semibold text-[var(--ink)]">今日</span>
        <span className="text-[13px] text-[#8b8b96] tabular-nums">{openTasks.length}</span>
      </div>

      <ul className="min-h-0 flex-1 overflow-auto">
        {openTasks.map((task) => {
          const selectedRow = selectedId === task.id;
          return (
            <li key={task.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelect(task.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(task.id);
                  }
                }}
                className={[
                  'flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors',
                  selectedRow ? 'bg-[#eef0ff]' : 'hover:bg-[#f6f6f8]',
                ].join(' ')}
              >
                <SquareCheck
                  checked={task.done}
                  label={`${task.title} を完了`}
                  onClick={() => onToggleDone(task)}
                />
                <span className="min-w-0 flex-1 truncate text-[14px] text-[var(--ink)]">
                  {task.title}
                </span>
                {task.time ? (
                  <span className="inline-flex shrink-0 items-center gap-1 text-[12px] text-[#7a85b0] tabular-nums">
                    <Clock3 className="size-3.5" strokeWidth={1.75} />
                    {task.time}
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
