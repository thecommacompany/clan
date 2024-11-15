import { useQuery } from '@tanstack/vue-query'
import { useTaskStore } from '@/stores/tasks'
import { useAppwrite } from '#imports'
import type { Task,TaskWithProjectData } from '@/types/task'
import type { Models  } from 'appwrite'


// function parse task 
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
        ) as Models.DocumentList<Models.Document>
        const tasks = response.documents.map(parseTask)
        taskStore.setTasks(tasks as TaskWithProjectData[])
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
      ) as Models.Document
      taskStore.setTask(parseTask(response))
      return true
    } catch (error) {
      console.error('Failed to fetch task:', error)
      throw error
    }
  }

  const updateTask = async (taskId: string, updatedData: Partial<Task>) => {
    try {
      // Only include fields that are present in the Task interface
      const allowedFields: (keyof Task)[] = ['title', 'status', 'priority', 'parent_task_id', 'assigned_to', 'completed', 'due_date']
      const filteredData = Object.fromEntries(
        Object.entries(updatedData).filter(([key]) => allowedFields.includes(key as keyof Task))
      ) as Partial<Task>

      const updatedTask = await database.updateDocument(
        config.public.databaseId,
        config.public.tasksCollectionId,
        taskId,
        filteredData
      ) as Models.Document
      
      taskStore.updateTasks(parseTask(updatedTask))
      taskStore.setTask(parseTask(updatedTask))
      return true
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
      return true
    } catch (error) {
      console.error('Failed to delete task:', error)
      throw error
    }
  }

  const toggleTaskCompletion = async (task: TaskWithProjectData) => {
    updateTask(task.$id, { completed: !task.completed })
    return true
  }

  const addTask = async (newTaskData: Partial<Task>) => {
    try {
      const response = await database.createDocument(
        config.public.databaseId,
        config.public.tasksCollectionId,
        'unique()',
        newTaskData
      ) as Models.Document
      const newTask = parseTask(response)
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