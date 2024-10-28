// composables/useProject.ts
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";
import { useQuery } from "@tanstack/vue-query";
import { useProjectStore } from "@/stores/project";
import { useTaskStore } from "@/stores/task";
import { useAppwrite } from '#imports'

export const useProject = (projectId: string) => {
  const config = useRuntimeConfig();
  const { database, Query } = useAppwrite();
  const projectStore = useProjectStore();
  const taskStore = useTaskStore();

  const fetchProjectTasks = async (projectId: string): Promise<Task[]> => {
    const response = await database.listDocuments(
      config.public.databaseId,
      config.public.tasksCollectionId,
      [Query.equal("project", projectId)],
    );
    return response.documents as Task[];
  };

  const calculateProjectStats = (tasks: Task[]) => {
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
        );

        const tasks = await fetchProjectTasks(projectId);
        const stats = calculateProjectStats(tasks);
        const projectData: Project = {
          ...response,
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
