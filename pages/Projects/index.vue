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
      <Breadcrumb class="mb-4 p-3">
      <BreadcrumbList>
        <BreadcrumbItem>
          <NuxtLink href="/">Home</NuxtLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Project</BreadcrumbPage> 
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
      <ProjectsHeader />
      <div class="p-3 flex flex-wrap gap-4">
        <ProjectsProject
          v-for="project in projectStore.projects"
          :key="project.$id"
          :project="project"
          class="max-w-sm w-full"
        />
      </div>
    </template>
  </div>
</template>
