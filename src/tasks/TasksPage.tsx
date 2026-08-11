import { type AuthUser } from "wasp/auth";
import { CreateTaskForm } from "./components/CreateTaskForm";
import { TaskList } from "./components/TaskList";

export const TasksPage = ({ user }: { user: AuthUser }) => {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-phi-5 px-phi-5 py-phi-6 md:px-phi-6">
      <header className="flex flex-col gap-phi-2">
        <h1 className="text-h1 font-semibold tracking-[-0.02em] text-foreground">
          {`${user.username} のタスク`}
        </h1>
        <p className="text-caption text-muted-foreground">
          大切なことを書き留めて、終わったら片付けましょう。
        </p>
      </header>

      <div className="flex flex-col gap-phi-2">
        <CreateTaskForm />
        <TaskList />
      </div>
    </div>
  );
};
