import { Trash2Icon } from "lucide-react";
import {
  deleteCompletedTasks,
  getTasks,
  useQuery,
} from "wasp/client/operations";
import { Button } from "../../shared/components/Button";
import { isDueToday, startOfToday } from "../dueDate";
import type { TaskWithTags } from "../queries";
import { TaskListItem } from "./TaskListItem";

export type TaskListView = "all" | "today";

type TaskListProps = {
  view?: TaskListView;
  asOf?: Date;
  emptyMessage?: string;
};

function matchesView(
  task: TaskWithTags,
  view: TaskListView,
  asOf: Date,
): boolean {
  switch (view) {
    case "all":
      return true;
    case "today":
      return isDueToday(task.dueAt, asOf);
    default: {
      const _exhaustive: never = view;
      return _exhaustive;
    }
  }
}

export function TaskList({
  view = "all",
  asOf,
  emptyMessage = "まだタスクがありません。上から追加してください。",
}: TaskListProps) {
  const calendarDay = asOf ?? startOfToday();
  const { data: tasks, isLoading, isSuccess } = useQuery(getTasks);

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

  const visibleTasks = tasks.filter((task) =>
    matchesView(task, view, calendarDay),
  );
  const completedTasks = visibleTasks.filter((task) => task.isDone);
  const canClearCompleted = view === "all" && completedTasks.length > 0;

  async function handleDeleteCompletedTasks() {
    if (view !== "all") {
      return;
    }
    try {
      await deleteCompletedTasks();
    } catch (err: unknown) {
      window.alert(`完了タスクの削除中にエラーが発生しました: ${String(err)}`);
    }
  }

  if (visibleTasks.length === 0) {
    return (
      <p className="px-phi-2 py-phi-6 text-body text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-phi-2">
      <ul className="flex flex-col">
        {visibleTasks.map((task) => (
          <TaskListItem task={task} key={task.id} />
        ))}
      </ul>
      <div className="mt-phi-4 flex items-center justify-between gap-phi-4 px-phi-2">
        <div className="text-caption text-muted-foreground">
          <span>{visibleTasks.length} 件</span>
          <span className="mx-phi-3">·</span>
          <span>{completedTasks.length} 件完了</span>
        </div>
        {canClearCompleted && (
          <Button
            className="flex items-center gap-phi-3"
            size="sm"
            variant="ghost"
            onClick={handleDeleteCompletedTasks}
          >
            <Trash2Icon data-icon="inline-start" />
            完了をクリア
          </Button>
        )}
      </div>
    </div>
  );
}
