export interface Task {
  $id: string;
  title: string;
  status: string;
  priority: string;
  parent_task_id: string | null;
  assigned_to: string[];
  completed: boolean;
  project: string;
  due_date: string;
}
