export type Task = {
  id: number;
  title: string;
  details: string;
  time: string;
  dueDate: string;
  done: boolean;
};

export type CreateTaskInput = {
  title: string;
  details: string;
  time: string;
  dueDate: string;
};

export type UpdateTaskInput = {
  title?: string;
  details?: string;
  time?: string;
  done?: boolean;
};
