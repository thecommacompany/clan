// composables/useProjects.ts
import { useQuery } from '@tanstack/vue-query'
import { useProjectStore } from '@/stores/project'
import { useAppwrite } from '#imports'
import type { Projects, Project } from '@/types/project'
import type { Models } from 'appwrite'
// function parse project
function parseProject(project: Models.Document): Project {
  return {
    $id: project.$id,
    title: project.title,
    description: project.description,
    $createdAt: project.$createdAt,
    $updatedAt: project.$updatedAt,
    $collectionId: project.$collectionId,
    $databaseId: project.$databaseId,
    $permissions: project.$permissions,
    category: project.category,
    status: project.status,
    due_date: project.due_date,
    start_date: project.start_date,
    Budget: project.budget,
    stats: {
      totalTasks: 0,
      completedTasks: 0,
      progress: 0
    }
  }
}

export const useProjects = () => {
  const config = useRuntimeConfig()
  const { database, Query } = useAppwrite()
  const projectStore = useProjectStore()

  const fetchProjectTasks = async (projectId: string) => {
    const response = await database.listDocuments(
      config.public.databaseId,
      config.public.tasksCollectionId,
      [Query.equal('project', projectId)]
    ) as Models.DocumentList<Models.Document>
    return response.documents
  }

  const calculateProjectStats = (tasks: any[]) => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(task => task.completed === true).length

    return {
      totalTasks,
      completedTasks,
      progress: totalTasks ? (completedTasks / totalTasks) * 100 : 0
    }
  }

  const { isPending, isError, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const response = await database.listDocuments(
          config.public.databaseId,
          config.public.projectsCollectionId
        ) as Models.DocumentList<Models.Document>

        const projectsWithStats = await Promise.all(
          response.documents.map(async (project) => {
            const taskResponse = await fetchProjectTasks(project.$id) as Models.Document[]
            console.log(taskResponse)
            return {
              ...project,
              stats: calculateProjectStats(taskResponse)
            }
          })
        ) as Projects

        projectStore.setProjects(projectsWithStats)
        return projectsWithStats
      } catch (error) {
        throw createError({
          statusCode: 500,
          message: 'Failed to fetch projects'
        })
      }
    }
  })

  const addProject = async (newProjectData: Partial<Project>) => {
    const config = useRuntimeConfig();
    const { database } = useAppwrite();
    const projectStore = useProjectStore();

    try {
      const response = await database.createDocument(
        config.public.databaseId,
        config.public.projectsCollectionId,
        'unique()',
        newProjectData
      ) as Models.Document;

      const newProject = parseProject(response)
      newProject.stats = { totalTasks: 0, completedTasks: 0, progress: 0 }

      // Use the new addProject action from the store
      projectStore.addProject(newProject)

      return newProject
    } catch (error) {
      console.error('Failed to add project:', error);
      throw error;
    }
  };

  return {
    isPending,
    isError,
    error,
    addProject
  }
}
