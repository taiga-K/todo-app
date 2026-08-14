import { type AuthUser } from "wasp/auth";
import { TasksViewPage } from "./TasksViewPage";

export const TasksPage = ({ user }: { user: AuthUser }) => {
  return <TasksViewPage user={user} view="all" />;
};
