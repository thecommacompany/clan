export interface Project {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  title: string;
  category: string;
  description: string;
  due_date: string;
  start_date: string;
  Budget: number;
  status: string;
  stats: {
    totalTasks: number;
    completedTasks: number;
    progress: number;
  }|undefined;
}
export type Projects = Project[];
