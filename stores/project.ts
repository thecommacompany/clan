import { defineStore, acceptHMRUpdate } from "pinia";

import type { Project, Projects } from "@/types/project";
import type { Task, TaskWithProjectData } from "@/types/task";
interface ProjectState {
  projects: Projects;
  project: Project | null;
  projectTasks: TaskWithProjectData[];
}

export const useProjectStore = defineStore("project", {
  state: (): ProjectState => ({
    projects: [],
    project: null,
    projectTasks: []
  }),
  actions: {
    setProjects(projects: Projects) {
      this.projects = projects;
    },
    setProject(project: Project) {
      this.project = project;
    },
    setProjectTasks(tasks: TaskWithProjectData[]) {
      this.projectTasks = tasks;
    },
    clearProject() {
      this.project = null;
    },
    updateProject(updatedProject: Project) {
      const index = this.projects.findIndex(p => p.$id === updatedProject.$id);
      if (index !== -1) {
        this.projects[index] = updatedProject;
      }
      if (this.project && this.project.$id === updatedProject.$id) {
        this.project = updatedProject;
      }
    },
    // Add this new action
    addProject(newProject: Project) {
      this.projects.push(newProject);
    },
    removeProject(projectId: string) {
      this.projects = this.projects.filter(p => p.$id !== projectId);
      if (this.project && this.project.$id === projectId) {
        this.project = null;
      }
    }
  },
  getters: {
    getProjects: (state) => state.projects,
    getProject: (state) => state.project
  },
});
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProjectStore, import.meta.hot));
}
