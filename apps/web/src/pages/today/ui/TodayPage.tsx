import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createTask,
  listTasksByDate,
  updateTask,
  type Task,
} from '@/entities/task';
import type { NewTaskPayload } from '@/features/add-task';
import { formatLocalDate } from '@/shared/lib/date';
import { Sidebar } from '@/widgets/sidebar';
import { TaskDetail } from '@/widgets/task-detail';
import { TaskList } from '@/widgets/task-list';

function sortTasksByTime(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.time === '' && b.time !== '') return 1;
    if (a.time !== '' && b.time === '') return -1;
    if (a.time !== b.time) return a.time.localeCompare(b.time);
    return a.id - b.id;
  });
}

export function TodayPage() {
  const today = useMemo(() => formatLocalDate(), []);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const openTasks = useMemo(() => tasks.filter((task) => !task.done), [tasks]);
  const selected =
    tasks.find((task) => task.id === selectedId) ?? openTasks[0] ?? null;

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const next = await listTasksByDate(today);
      setTasks(next);
      setSelectedId((current) => {
        if (current != null && next.some((task) => task.id === current)) {
          return current;
        }
        const firstOpen = next.find((task) => !task.done);
        return firstOpen?.id ?? next[0]?.id ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to load tasks');
    } finally {
      setBusy(false);
    }
  }, [today]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAdd(input: NewTaskPayload) {
    setBusy(true);
    setError(null);
    try {
      const created = await createTask({
        title: input.title,
        details: input.details,
        time: input.time,
        dueDate: today,
      });
      setTasks((current) => sortTasksByTime([created, ...current]));
      setSelectedId(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to create task');
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleDone(task: Task) {
    const nextDone = !task.done;
    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, done: nextDone } : item)),
    );
    try {
      const updated = await updateTask(task.id, { done: nextDone });
      setTasks((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      setTasks((current) =>
        current.map((item) => (item.id === task.id ? { ...item, done: task.done } : item)),
      );
      setError(err instanceof Error ? err.message : 'failed to update task');
    }
  }

  async function handleDetailsChange(details: string) {
    if (!selected) return;
    const taskId = selected.id;
    const previous = selected.details;
    setTasks((current) =>
      current.map((item) => (item.id === taskId ? { ...item, details } : item)),
    );
    try {
      const updated = await updateTask(taskId, { details });
      setTasks((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      setTasks((current) =>
        current.map((item) =>
          item.id === taskId ? { ...item, details: previous } : item,
        ),
      );
      setError(err instanceof Error ? err.message : 'failed to update details');
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--shell)]">
      <Sidebar todayCount={openTasks.length} />
      <main className="flex h-full min-w-0 flex-1 border-l border-[var(--shell-border)] bg-[#f6f6f8]">
        <TaskList
          tasks={tasks}
          selectedId={selected?.id ?? null}
          onSelect={setSelectedId}
          onToggleDone={handleToggleDone}
          onAdd={handleAdd}
          busy={busy}
        />
        <TaskDetail task={selected} onDetailsChange={handleDetailsChange} />
      </main>
      {error ? (
        <div
          role="alert"
          className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-[#2a2a30] px-4 py-2 text-[13px] text-white shadow-lg"
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}
