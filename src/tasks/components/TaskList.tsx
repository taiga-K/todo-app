import { ChevronRightIcon, Trash2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  deleteCompletedTasks,
  getTasks,
  updateTask,
  useQuery,
} from "wasp/client/operations";
import { cn } from "../../lib/utils";
import { Button } from "../../shared/components/Button";
import { TaskListItem } from "./TaskListItem";

const COMPLETE_MOVE_DELAY_MS = 1000;

export function TaskList() {
  const { data: tasks, isLoading, isSuccess } = useQuery(getTasks);
  const [isCompletedOpen, setIsCompletedOpen] = useState(false);
  const [pendingCompleteIds, setPendingCompleteIds] = useState<Set<string>>(
    () => new Set(),
  );
  const pendingTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    const timers = pendingTimersRef.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  function clearPendingTimer(taskId: string) {
    const timer = pendingTimersRef.current.get(taskId);
    if (timer !== undefined) {
      clearTimeout(timer);
      pendingTimersRef.current.delete(taskId);
    }
  }

  function removePendingComplete(taskId: string) {
    clearPendingTimer(taskId);
    setPendingCompleteIds((prev) => {
      if (!prev.has(taskId)) {
        return prev;
      }
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
  }

  async function completeTask(taskId: string): Promise<void> {
    clearPendingTimer(taskId);
    setPendingCompleteIds((prev) => {
      const next = new Set(prev);
      next.add(taskId);
      return next;
    });

    const timer = setTimeout(() => {
      pendingTimersRef.current.delete(taskId);
      setPendingCompleteIds((prev) => {
        if (!prev.has(taskId)) {
          return prev;
        }
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }, COMPLETE_MOVE_DELAY_MS);
    pendingTimersRef.current.set(taskId, timer);

    try {
      await updateTask({
        id: taskId,
        isDone: true,
      });
    } catch (err: unknown) {
      removePendingComplete(taskId);
      window.alert(`タスクの更新中にエラーが発生しました: ${String(err)}`);
    }
  }

  async function uncompleteTask(taskId: string): Promise<void> {
    removePendingComplete(taskId);
    try {
      await updateTask({
        id: taskId,
        isDone: false,
      });
    } catch (err: unknown) {
      window.alert(`タスクの更新中にエラーが発生しました: ${String(err)}`);
    }
  }

  async function handleDoneChange(
    taskId: string,
    isDone: boolean,
  ): Promise<void> {
    if (isDone) {
      await completeTask(taskId);
    } else {
      await uncompleteTask(taskId);
    }
  }

  async function handleDeleteCompletedTasks() {
    try {
      for (const taskId of pendingCompleteIds) {
        clearPendingTimer(taskId);
      }
      setPendingCompleteIds(new Set());
      await deleteCompletedTasks();
    } catch (err: unknown) {
      window.alert(`完了タスクの削除中にエラーが発生しました: ${String(err)}`);
    }
  }

  if (isLoading) {
    return (
      <p className="px-phi-2 py-phi-5 text-body text-muted-foreground">
        読み込み中...
      </p>
    );
  }

  if (!isSuccess) {
    return (
      <p className="px-phi-2 py-phi-5 text-body text-destructive">
        タスクの読み込みに失敗しました。
      </p>
    );
  }

  if (tasks.length === 0) {
    return (
      <p className="px-phi-2 py-phi-6 text-body text-muted-foreground">
        まだタスクがありません。上から追加してください。
      </p>
    );
  }

  const activeTasks = tasks.filter(
    (task) => !task.isDone || pendingCompleteIds.has(task.id),
  );
  const completedTasks = tasks.filter(
    (task) => task.isDone && !pendingCompleteIds.has(task.id),
  );

  return (
    <div className="flex flex-col gap-phi-2">
      {activeTasks.length > 0 ? (
        <ul className="flex flex-col">
          {activeTasks.map((task) => {
            const appearDone =
              task.isDone || pendingCompleteIds.has(task.id);
            return (
              <TaskListItem
                key={task.id}
                task={appearDone && !task.isDone ? { ...task, isDone: true } : task}
                onDoneChange={handleDoneChange}
              />
            );
          })}
        </ul>
      ) : (
        <p className="px-phi-2 py-phi-5 text-body text-muted-foreground">
          未完了のタスクはありません。
        </p>
      )}

      {completedTasks.length > 0 ? (
        <div className="mt-phi-4 flex flex-col gap-phi-2">
          <div className="flex items-center justify-between gap-phi-4 px-phi-2">
            <button
              type="button"
              className="flex min-h-8 cursor-pointer items-center gap-phi-2 text-caption text-muted-foreground transition-colors hover:text-foreground"
              aria-expanded={isCompletedOpen}
              onClick={() => setIsCompletedOpen((open) => !open)}
            >
              <ChevronRightIcon
                className={cn(
                  "size-3.5 shrink-0 transition-transform duration-150",
                  isCompletedOpen && "rotate-90",
                )}
              />
              <span>完了</span>
              <span>{completedTasks.length}</span>
            </button>
            <Button
              className="flex items-center gap-phi-3"
              size="sm"
              variant="ghost"
              onClick={() => {
                void handleDeleteCompletedTasks();
              }}
            >
              <Trash2Icon data-icon="inline-start" />
              完了をクリア
            </Button>
          </div>
          {isCompletedOpen ? (
            <ul className="flex flex-col">
              {completedTasks.map((task) => (
                <TaskListItem
                  key={task.id}
                  task={task}
                  onDoneChange={handleDoneChange}
                />
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
