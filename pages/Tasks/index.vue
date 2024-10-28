<script setup lang="ts">
import { useTaskStore } from "@/stores/tasks";
import { useTasks } from "@/composables/useTasks";

const taskStore = useTaskStore();
const { isPending, isError, error } = useTasks();
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
      <TasksHeader />
      <div class="p-3">
        <TasksList :tasks="taskStore.tasks" />

      </div>
    </template>
  </div>
</template>
