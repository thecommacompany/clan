import { defineStore, acceptHMRUpdate } from "pinia";

export interface Task {
  $id: string;
  title: string;
  status: string;
  priority: string;
  parent_task_id: string | null;
  assigned_to: string[];
  completed: boolean;
}

export const useTaskStore = defineStore("task", {
  state: () => ({
    tasks: [] as Task[],
  }),
  actions: {
    setTasks(tasks: Task[]) {
      this.tasks = tasks;
    },
    clearTasks() {
      this.tasks = [];
    },
    updateTask(updatedTask: Task) {
      const index = this.tasks.findIndex(task => task.$id === updatedTask.$id);
      if (index !== -1) {
        this.tasks[index] = updatedTask;
      }
    },
    removeTask(taskId: string) {
      this.tasks = this.tasks.filter(task => task.$id !== taskId);
    },
    addTask(newTask: Task) {
      this.tasks.push(newTask);
    },
  },
  getters: {
    getTasks: (state) => state.tasks,
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTaskStore, import.meta.hot));
}
