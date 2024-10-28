<script setup lang="ts">
import { useProjectStore } from "@/stores/project";
import { useProjects } from "@/composables/useProjects";

const projectStore = useProjectStore();
const { isPending, isError, error } = useProjects();
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <template v-if="isPending">
      <div>Loading...</div>
    </template>
    
    <template v-else-if="isError">
      <div>{{ error }}</div>
    </template>
    
    <template v-else>
      <ProjectsHeader />
      <div class="p-3">
        <ProjectsProject
          v-for="project in projectStore.projects"
          :key="project.$id"
          :project="project"
          class="max-w-sm"
        />
      </div>
    </template>
  </div>
</template>
