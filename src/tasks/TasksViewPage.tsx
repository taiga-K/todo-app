import { type AuthUser } from "wasp/auth";
import { CreateTaskForm } from "./components/CreateTaskForm";
import { TaskList, type TaskListView } from "./components/TaskList";
import { startOfToday } from "./dueDate";

type TasksViewPageProps = {
  user: AuthUser;
  view: TaskListView;
};

function viewCopy(
  view: TaskListView,
  username: string,
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
        defaultDue: startOfToday(),
      };
    default: {
      const _exhaustive: never = view;
      return _exhaustive;
    }
  }
}

export function TasksViewPage({ user, view }: TasksViewPageProps) {
  const copy = viewCopy(view, user.username);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-phi-5 px-phi-5 py-phi-6 md:px-phi-6">
      <header className="flex flex-col gap-phi-2">
        <h1 className="text-h1 font-semibold tracking-[-0.02em] text-foreground">
          {copy.title}
        </h1>
        <p className="text-caption text-muted-foreground">{copy.description}</p>
      </header>

      <div className="flex flex-col gap-phi-2">
        <CreateTaskForm defaultDue={copy.defaultDue} />
        <TaskList view={view} emptyMessage={copy.emptyMessage} />
      </div>
    </div>
  );
}
