<template>
  <div class="max-w-7xl mx-auto">
    <Card>
      <CardHeader>
        <CardTitle>My Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <TasksList :tasks="myTasks" v-if="myTasks.length" />
        <div v-else>No tasks found</div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useTasks } from "@/composables/useTasks";
import { useAuthStore } from "@/stores/auth";

import type { TaskWithProjectData } from "@/types/task";


const { tasks,isPending, isError, error } = useTasks();
const authStore = useAuthStore();

const myTasks = ref<TaskWithProjectData[]>([]);
// Get current user's tasks
watch(() => tasks.value, async () => {
  
  if(tasks.value?.length){
    
    myTasks.value = tasks.value.filter(task =>{
      return task.assigned_to.includes(authStore.sessionID)
    })
  }
}, { immediate: true });
</script>
