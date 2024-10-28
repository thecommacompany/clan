import { useQuery } from '@tanstack/vue-query'
import { useTaskStore } from '@/stores/tasks'
import { useAppwrite } from '#imports'
import type { Task } from '@/stores/tasks'

export const useTasks = () => {
  const config = useRuntimeConfig()
  const { database } = useAppwrite()
  const taskStore = useTaskStore()

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      try {
        const response = await database.listDocuments(
          config.public.databaseId,
          config.public.tasksCollectionId
        )

        const tasks = response.documents as Task[]
        taskStore.setTasks(tasks)
        return tasks
      } catch (error) {
        throw createError({
          statusCode: 500,
          message: 'Failed to fetch tasks'
        })
      }
    }
  })

  const fetchTask = async (taskId: string) => {
    try {
      const response = await database.getDocument(
        config.public.databaseId,
        config.public.tasksCollectionId,
        taskId
      )
      return response as Task
    } catch (error) {
      console.error('Failed to fetch task:', error)
      throw error
    }
  }

  const updateTask = async (taskId: string, updatedData: Partial<Task>) => {
    try {
      // Only include fields that are present in the Task interface
      const allowedFields: (keyof Task)[] = ['title', 'status', 'priority', 'parent_task_id', 'assigned_to', 'completed']
      const filteredData = Object.fromEntries(
        Object.entries(updatedData).filter(([key]) => allowedFields.includes(key as keyof Task))
      )

      const updatedTask = await database.updateDocument(
        config.public.databaseId,
        config.public.tasksCollectionId,
        taskId,
        filteredData
      )
      taskStore.updateTask(updatedTask as Task)
      return updatedTask as Task
    } catch (error) {
      console.error('Failed to update task:', error)
      throw error
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      await database.deleteDocument(
        config.public.databaseId,
        config.public.tasksCollectionId,
        taskId
      )
      taskStore.removeTask(taskId)
    } catch (error) {
      console.error('Failed to delete task:', error)
      throw error
    }
  }

  const toggleTaskCompletion = async (task: Task) => {
    return updateTask(task.$id, { completed: !task.completed })
  }

  const addTask = async (newTaskData: Partial<Task>) => {
    try {
      const response = await database.createDocument(
        config.public.databaseId,
        config.public.tasksCollectionId,
        'unique()',
        newTaskData
      )
      const newTask = response as Task
      taskStore.addTask(newTask)
      return newTask
    } catch (error) {
      console.error('Failed to add task:', error)
      throw error
    }
  }

  return {
    tasks: data,
    isPending,
    isError,
    error,
    fetchTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    addTask
  }
}
