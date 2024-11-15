// composables/useProject.ts
import type { Project } from "@/types/project";
import type { Task, TaskWithProjectData } from "@/types/task";
import { useQuery } from "@tanstack/vue-query";
import { useProjectStore } from "@/stores/project";
import { useTaskStore } from "@/stores/tasks";
import type {Models} from "appwrite"


function parseTask(task: Models.Document): TaskWithProjectData {
  return {
    $id: task.$id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    parent_task_id: task.parent_task_id,
    assigned_to: task.assigned_to,
    completed: task.completed,
    project: task.project,
    due_date: task.due_date // Add due_date field
  }
}
function parseProject(project: Models.Document): Project {
  return {
    $id: project.$id,
    $collectionId: project.$collectionId,
    $databaseId: project.$databaseId,
    $createdAt: project.$createdAt,
    $updatedAt: project.$updatedAt,
    $permissions: project.$permissions,
    title: project.title,
    category: project.category,
    description: project.description,
    due_date: project.due_date,
    start_date: project.start_date,
    Budget: project.Budget,
    status: project.status,
    stats: project.stats
  }
}

export const useProject = (projectId: string) => {
  const config = useRuntimeConfig();
  const { database, Query } = useAppwrite();
  const projectStore = useProjectStore();
  const taskStore = useTaskStore();

  const fetchProjectTasks = async (projectId: string): Promise<TaskWithProjectData[]> => {
    const response = await database.listDocuments(
      config.public.databaseId,
      config.public.tasksCollectionId,
      [Query.equal("project", projectId)],
    ) as Models.DocumentList<Models.Document>;
    const tasks = response.documents.map(parseTask);
    projectStore.setProjectTasks(tasks);
    return tasks;
  };

  const calculateProjectStats = (tasks: TaskWithProjectData[]) => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (task) => task.completed === true,
    ).length;

    return {
      totalTasks,
      completedTasks,
      progress: totalTasks ? (completedTasks / totalTasks) * 100 : 0,
    };
  };

  const { isPending, isError, error, data: project, refetch } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async (): Promise<Project> => {
      try {
        const response = await database.getDocument(
          config.public.databaseId,
          config.public.projectsCollectionId,
          projectId,
        ) as Models.Document;
        const parsedProject = parseProject(response);

        const tasks = await fetchProjectTasks(projectId);
        const stats = calculateProjectStats(tasks);
        const projectData: Project = {
          ...parsedProject,
          stats: stats,
        };

        projectStore.setProject(projectData);
        taskStore.setTasks(tasks); // Set tasks in the task store
        return projectData;
      } catch (error) {
        throw createError({
          statusCode: 500,
          statusMessage: "Failed to fetch project",
        });
      }
    },
  });

  const updateProject = async (updatedProject: Partial<Project>) => {
    try {
      const response = await database.updateDocument(
        config.public.databaseId,
        config.public.projectsCollectionId,
        projectId,
        updatedProject
      );
      projectStore.updateProject(response as Project);
      return response;
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await database.deleteDocument(
        config.public.databaseId,
        config.public.projectsCollectionId,
        projectId
      );
      projectStore.removeProject(projectId);
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  };

  return {
    isPending,
    isError,
    error,
    updateProject,
    deleteProject,
    refetch,
  };
};
