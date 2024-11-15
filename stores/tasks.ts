import { defineStore, acceptHMRUpdate } from "pinia";
import type { Task } from "@/types/task";
import type { TaskWithProjectData } from "@/types/task";

function formatDate(date: string) {
  return new Date(date).toISOString().split("T")[0];
}


export const useTaskStore = defineStore("task", {
  state: () => ({
    tasks: [] as TaskWithProjectData[],
    task: null as TaskWithProjectData | null
  }),
  actions: {
    setTasks(tasks: TaskWithProjectData[]) {
      this.tasks = tasks;
    },
    setTask(task: TaskWithProjectData) {
      const fromattedTask = {...task, due_date: formatDate(task.due_date)}
      this.task = fromattedTask;
    },
    clearTasks() {
      this.tasks = [];
    },
    updateTasks(updatedTask: TaskWithProjectData) {
      const index = this.tasks.findIndex(task => task.$id === updatedTask.$id);
      if (index !== -1) {
        this.tasks[index] = updatedTask;
      }
    },
    removeTask(taskId: string) {
      this.tasks = this.tasks.filter(task => task.$id !== taskId);
    },
    addTask(newTask: TaskWithProjectData) {
      this.tasks.push(newTask);
    },
  },
  getters: {
    getTasks: (state) => state.tasks,
    getTask: (state) => state.task
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTaskStore, import.meta.hot));
}
