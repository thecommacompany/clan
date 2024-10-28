<script setup lang="ts">

import type { Task } from '@/stores/tasks';

const route = useRoute();
const router = useRouter();
const { fetchTask, updateTask, deleteTask, toggleTaskCompletion } = useTasks();

const task = ref<Task | null>(null);
const isEditing = ref(false);
const editedTask = ref<Partial<Task> | null>(null);

const fetchTaskData = async () => {
  try {
    task.value = await fetchTask(route.params.id as string);
    editedTask.value = { ...task.value };
  } catch (error) {
    console.error('Failed to fetch task:', error);
  }
};

const handleUpdateTask = async () => {
  if (editedTask.value && task.value) {
    try {
      const updatedTask = await updateTask(task.value.$id, editedTask.value);
      task.value = updatedTask;
      isEditing.value = false;
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }
};

const handleDeleteTask = async () => {
  if (task.value && confirm('Are you sure you want to delete this task?')) {
    try {
      await deleteTask(task.value.$id);
      router.push('/tasks');
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }
};

const handleToggleCompletion = async () => {
  if (task.value) {
    try {
      const updatedTask = await toggleTaskCompletion(task.value);
      task.value = updatedTask;
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
    }
  }
};

onMounted(fetchTaskData);
</script>

<template>
  <div v-if="task" class="max-w-2xl mx-auto mt-8 p-6">
    <Card>
      <CardHeader>
        <CardTitle>{{ isEditing ? 'Edit Task' : task.title }}</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="!isEditing" class="space-y-4">
          <div class="flex items-center space-x-2">
            <Badge>{{ task.status }}</Badge>
            <Badge>{{ task.priority }}</Badge>
          </div>
          <p><strong>Assigned to:</strong> {{ task.assigned_to.join(', ') || 'Unassigned' }}</p>
          <div class="flex items-center space-x-2">
            <Checkbox :checked="task.completed" @update:checked="handleToggleCompletion" />
            <span>{{ task.completed ? 'Completed' : 'Not Completed' }}</span>
          </div>
        </div>

        <form v-else @submit.prevent="handleUpdateTask" class="space-y-4">
          <div>
            <Label for="title">Title</Label>
            <Input id="title" v-model="editedTask.title" required />
          </div>
          <div>
            <Label for="status">Status</Label>
            <Select v-model="editedTask.status">
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label for="priority">Priority</Label>
            <Select v-model="editedTask.priority">
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label for="assigned_to">Assigned To</Label>
            <Input id="assigned_to" v-model="editedTask.assigned_to" />
          </div>
        </form>
      </CardContent>
      <CardFooter class="flex justify-between">
        <div v-if="!isEditing">
          <Button @click="isEditing = true">Edit</Button>
          <Button @click="handleDeleteTask" variant="destructive" class="ml-2">Delete</Button>
        </div>
        <div v-else>
          <Button @click="handleUpdateTask" type="submit">Save</Button>
          <Button @click="isEditing = false" variant="outline" class="ml-2">Cancel</Button>
        </div>
      </CardFooter>
    </Card>
  </div>
  <div v-else class="text-center mt-8">
    <Spinner />
  </div>
</template>
