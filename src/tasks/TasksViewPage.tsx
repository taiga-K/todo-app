import { useEffect, useRef, useState } from "react";
import { type AuthUser } from "wasp/auth";
import { getTasks, useQuery } from "wasp/client/operations";
import { CreateTaskForm } from "./components/CreateTaskForm";
import {
  TaskDetailPanel,
  type TaskDetailPanelHandle,
} from "./components/TaskDetailPanel";
import { TaskList, type TaskListView } from "./components/TaskList";
import { useLocalCalendarDay } from "./useLocalCalendarDay";

type TasksViewPageProps = {
  user: AuthUser;
  view: TaskListView;
};

function viewCopy(
  view: TaskListView,
  username: string,
  today: Date,
): {
  title: string;
  description: string;
  emptyMessage: string;
  defaultDue: Date | null;
} {
  switch (view) {
    case "all":
      return {
        title: `${username} のタスク`,
        description: "大切なことを書き留めて、終わったら片付けましょう。",
        emptyMessage: "まだタスクがありません。上から追加してください。",
        defaultDue: null,
      };
    case "today":
      return {
        title: "Today",
        description: "今日が期限のタスクです。",
        emptyMessage: "今日が期限のタスクはありません。",
        defaultDue: today,
      };
    default: {
      const _exhaustive: never = view;
      return _exhaustive;
    }
  }
}

export function TasksViewPage({ user, view }: TasksViewPageProps) {
  const today = useLocalCalendarDay();
  const copy = viewCopy(view, user.username, today);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const panelRef = useRef<TaskDetailPanelHandle>(null);
  const { data: tasks, isLoading, isSuccess } = useQuery(getTasks);
  const selectedTask =
    tasks?.find((task) => task.id === selectedTaskId) ?? null;

  useEffect(() => {
    if (
      selectedTaskId !== null &&
      tasks !== undefined &&
      !tasks.some((task) => task.id === selectedTaskId)
    ) {
      setSelectedTaskId(null);
    }
  }, [tasks, selectedTaskId]);

  async function selectTask(taskId: string): Promise<void> {
    await panelRef.current?.flush();
    setSelectedTaskId((current) => (current === taskId ? null : taskId));
  }

  return (
    <div className="flex min-h-0 w-full flex-1">
      <div className="flex min-w-0 flex-1 justify-center px-phi-5 py-phi-6 md:px-phi-6">
        <div className="flex w-full max-w-xl flex-col gap-phi-5">
          <header className="flex flex-col gap-phi-2">
            <h1 className="text-h1 font-semibold tracking-[-0.02em] text-foreground">
              {copy.title}
            </h1>
            <p className="text-caption text-muted-foreground">
              {copy.description}
            </p>
          </header>

          <div className="flex flex-col gap-phi-2">
            <CreateTaskForm defaultDue={copy.defaultDue} />
            <TaskList
              view={view}
              asOf={today}
              emptyMessage={copy.emptyMessage}
              tasks={tasks}
              isLoading={isLoading}
              isSuccess={isSuccess}
              selectedTaskId={selectedTaskId}
              onSelectTask={(taskId) => {
                void selectTask(taskId);
              }}
            />
          </div>
        </div>
      </div>

      {selectedTask && (
        <div className="w-[38.2%] min-w-[20rem] max-w-md self-stretch">
          <TaskDetailPanel
            ref={panelRef}
            task={selectedTask}
            onClose={() => setSelectedTaskId(null)}
          />
        </div>
      )}
    </div>
  );
}
