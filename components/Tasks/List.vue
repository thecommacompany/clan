<script setup lang="ts">
import { useTaskStore } from "@/stores/tasks";
import { useTasks } from "@/composables/useTasks";
import type { Task } from "@/types/task";

const props = defineProps({
  tasks: {
    type: Array as () => Task[],
    required: true,
  },
});

const { toggleTaskCompletion } = useTasks();
</script>

<template>
  <div class="max-w-7xl mx-auto flex flex-col gap-4">
    <Card v-for="task in tasks" :key="task.$id" @click="navigateTo(`/tasks/${task.$id}`)">
     
        <CardHeader>
          <CardTitle class="flex justify-between items-center">
            <div>
              <Checkbox :checked="task.completed" @update:checked="() => toggleTaskCompletion(task)" class="mr-2" @click="(e:Event) => e.stopPropagation()"/>
              {{ task.title }}
            </div>
            <div>
              <Badge>{{ task.priority }}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>status: {{ task.status }}</div>
          <div>assigned to: {{ task.assigned_to }}</div>
        </CardContent>
      
    </Card>
  </div>
</template>
