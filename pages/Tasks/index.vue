<script setup lang="ts">
import { useTaskStore } from "@/stores/tasks";
import { useTasks } from "@/composables/useTasks";

const taskStore = useTaskStore();
const { isPending, isError, error } = useTasks();
const { fetchUser } = useUserDatabase();


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
          <BreadcrumbPage>Tasks</BreadcrumbPage> 
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
      <TasksHeader />
      <div class="p-3">
        <TasksList :tasks="taskStore.tasks" />

      </div>
    </template>
  </div>
</template>
