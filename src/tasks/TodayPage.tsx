import { type AuthUser } from "wasp/auth";
import { TasksViewPage } from "./TasksViewPage";

export const TodayPage = ({ user }: { user: AuthUser }) => {
  return <TasksViewPage user={user} view="today" />;
};
