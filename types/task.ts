import type { Project } from "./project";
interface TaskBase<T = string> {
  $id: string;
  title: string;
  status: string;
  priority: string;
  parent_task_id: string | null;
  assigned_to: string[];
  completed: boolean;
  project: T;
  due_date: string;
}
export type Task = TaskBase<string>;  // project is string
export type TaskWithProjectData = TaskBase<Project>;  // project is object