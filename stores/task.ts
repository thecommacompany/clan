import { defineStore } from 'pinia'
import type { Task } from '@/types/task'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [] as Task[]
  }),
  actions: {
    setTasks(tasks: Task[]) {
      this.tasks = tasks
    },
    addTask(task: Task) {
      this.tasks.push(task)
    },
    updateTask(updatedTask: Task) {
      const index = this.tasks.findIndex(t => t.$id === updatedTask.$id)
      if (index !== -1) {
        this.tasks[index] = updatedTask
      }
    },
    removeTask(taskId: string) {
      this.tasks = this.tasks.filter(t => t.$id !== taskId)
    }
  },
  getters: {
    getTasksByProject: (state) => (projectId: string) => {
      return state.tasks.filter(task => task.project === projectId)
    }
  }
})
