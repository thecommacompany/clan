<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useTasks } from "@/composables/useTasks";
import type { Task } from "@/types/task";
import type { User } from "@/types/user";
import UserSelector from "@/components/Tasks/UserSelector.vue";
import { useProjectStore } from "@/stores/project";
import { createTaskSchema, TaskStatus, TaskPriority } from "@/schemas/task";
import type { CreateTask } from "@/schemas/task";
import { useProjects } from "@/composables/useProjects";
import { ZodError } from "zod";

const projectStore = useProjectStore();
const taskStatus = ref("pending");
const taskShow = ref("all");
const isDialogOpen = ref(false);
let selectedUsers = ref<User[]>([]);
const validationErrors = ref<Record<string, string>>({});

const newTask = ref<CreateTask>({
  title: "",
  status: TaskStatus.TODO,
  priority: TaskPriority.MEDIUM,
  assigned_to: [],
  completed: false,
  due_date: "",
  project: "",
  parent_task_id: null
});

const { isPending: isProjectsLoading, isError: isProjectsError, error: projectsError } = useProjects();
const { addTask } = useTasks();

// Fetch projects when component mounts


const validateTask = () => {
  try {
    createTaskSchema.parse(newTask.value);
    validationErrors.value = {};
    return true;
  } catch (error) {
    // check if error is zod error
    if (error instanceof ZodError) {
      validationErrors.value = error.errors.reduce<Record<string, string>>((acc, curr) => {
        acc[curr.path[0]] = curr.message;
        return acc;
      }, {});
    }
    return false;
  }
};

const handleAddTask = async () => {
  if (!validateTask()) {
    return;
  }

  if (!newTask.value.assigned_to) {
    newTask.value.assigned_to = [];
  }
  
  selectedUsers.value.forEach((user) => {
    newTask.value.assigned_to!.push(user.userID);
  });



  await addTask(newTask.value);

  isDialogOpen.value = false;
  newTask.value = {
    title: "",
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    assigned_to: [],
    completed: false,
    due_date: "",
    project: "",
    parent_task_id: null
  };
  selectedUsers.value = [];
};

const formatDate = (date: string | null) => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between w-full">
      <h1 class="text-2xl font-bold">Tasks</h1>
      <Dialog v-model:open="isDialogOpen">
        <DialogTrigger as-child>
          <Button> Add Task </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>
              Add a new task to your project.
            </DialogDescription>
          </DialogHeader>
          
          <form @submit.prevent="handleAddTask" class="space-y-4">
            <div>
              <Label for="title">Title</Label>
              <Input id="title" v-model="newTask.title" required />
              <div v-if="validationErrors.title" class="text-red-500">{{ validationErrors.title }}</div>
            </div>
            <div>
              <Label for="status">Status</Label>
              <Select v-model="newTask.status">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label for="priority">Priority</Label>
              <Select v-model="newTask.priority">
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Priority</SelectLabel>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label for="assigned_to">Assigned To</Label>
              <UserSelector v-model="selectedUsers" />
            </div>
            <div>
              <Label for="due_date">Due Date</Label>
              <Input id="due_date" type="date" v-model="newTask.due_date" />
              <div v-if="validationErrors.due_date" class="text-red-500">{{ validationErrors.due_date }}</div>
            </div>
            <div>
              <Label for="project">Project</Label>
              <Select v-model="newTask.project">
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="project in projectStore.getProjects"
                    :key="project.$id"
                    :value="project.$id"
                  >
                    {{ project.title }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <div v-if="validationErrors.project" class="text-red-500">{{ validationErrors.project }}</div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Select v-model="taskStatus">
          <SelectTrigger>
            <SelectValue placeholder="Select task Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value="pending"> Pending </SelectItem>
              <SelectItem value="completed"> Completed </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select v-model="taskShow">
          <SelectTrigger>
            <SelectValue placeholder="Select tasks to show" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Show</SelectLabel>
              <SelectItem value="all"> All </SelectItem>
              <SelectItem value="my"> My Tasks </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
</template>
