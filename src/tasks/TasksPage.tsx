import { type AuthUser } from "wasp/auth";
import { CreateTaskForm } from "./components/CreateTaskForm";
import { TaskList } from "./components/TaskList";

export const TasksPage = ({ user }: { user: AuthUser }) => {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-6 py-10 md:px-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-foreground">
          {`${user.username} のタスク`}
        </h1>
        <p className="text-[13px] text-muted-foreground">
          大切なことを書き留めて、終わったら片付けましょう。
        </p>
      </header>

      <div className="flex flex-col gap-1">
        <CreateTaskForm />
        <TaskList />
      </div>
    </div>
  );
};
