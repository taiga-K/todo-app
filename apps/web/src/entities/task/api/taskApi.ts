import { apiFetch } from '@/shared/api/client';
import type { CreateTaskInput, Task, UpdateTaskInput } from '../model/types';

export function listTasksByDate(date: string): Promise<Task[]> {
  return apiFetch<Task[]>(`/api/tasks?date=${encodeURIComponent(date)}`);
}

export function createTask(input: CreateTaskInput): Promise<Task> {
  return apiFetch<Task>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateTask(id: number, input: UpdateTaskInput): Promise<Task> {
  return apiFetch<Task>(`/api/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}
