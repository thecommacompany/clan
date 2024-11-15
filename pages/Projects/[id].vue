<script setup lang="ts">
import { useProjectStore } from "@/stores/project";
import { useProject } from "@/composables/useProject";
import { useRouter } from "vue-router";
import type { Project } from "@/types/project";
import { useTasks } from "@/composables/useTasks";
import type { Task } from "@/types/task";
import type { User } from "@/types/user";
import UserSelector from "@/components/Tasks/UserSelector.vue";
const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const { isPending, isError, error, updateProject, deleteProject, refetch } = useProject(route.params.id as string);

// Optional: Clear project when component unmounts
onUnmounted(() => {
  projectStore.clearProject();
});

const taskShow = ref("my");

const isEditDialogOpen = ref(false);
const editedProject = ref<Partial<Project>>({});

const openEditDialog = () => {
  if (projectStore.project) {
    editedProject.value = {
      title: projectStore.project.title,
      category: projectStore.project.category,
      description: projectStore.project.description,
      Budget: projectStore.project.Budget,
      start_date: "",
      due_date: ""
    };
    const formattedDate = new Date(projectStore.project.start_date).toISOString().split("T")[0]
    editedProject.value.start_date = formattedDate;
    const formattedDate2 = new Date(projectStore.project.due_date).toISOString().split("T")[0]
    editedProject.value.due_date = formattedDate2;
  }
  isEditDialogOpen.value = true;
};

const handleUpdateProject = async () => {
  if (!editedProject.value || !projectStore.project) return;
  try {
    // Create an object with only the changed fields
    const updatedFields = editedProject.value

    if (Object.keys(updatedFields).length === 0) {
      // No changes were made
      isEditDialogOpen.value = false;
      return;
    }

    await updateProject(updatedFields);
    isEditDialogOpen.value = false;
    // Refresh the project data
    await refetch();
  } catch (error) {
    console.error('Failed to update project:', error);
  }
};

const handleDeleteProject = async () => {
  if (!projectStore.project) return;
  if (confirm('Are you sure you want to delete this project?')) {
    try {
      await deleteProject(projectStore.project.$id);
      // Redirect to /projects after successful deletion
      router.push('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  }
};

// add task to project
const isAddTaskDialogOpen = ref(false);
const selectedUsers = ref<User[]>([]);
const newTask = ref<Partial<Task>>({
  title: "",
  status: "todo",
  priority: "medium",
  assigned_to: [],
  completed: false,
  due_date: "",
  project: route.params.id as string // Pre-fill with current project ID
});

const { addTask } = useTasks();

const handleAddTask = async () => {
  if (!newTask.value.assigned_to) {
    newTask.value.assigned_to = [];
  }
  selectedUsers.value.forEach((user) => {
    newTask.value.assigned_to!.push(user.$id);
  });

  await addTask(newTask.value);
  isAddTaskDialogOpen.value = false;
  // Reset form
  newTask.value = {
    title: "",
    status: "todo",
    priority: "medium",
    assigned_to: [],
    completed: false,
    due_date: "",
    project: route.params.id as string
  };
  selectedUsers.value = [];
  await refetch(); // Refresh the project data to show new task
};
</script>

<template>
  <div class="p-2">
    <Breadcrumb class="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <NuxtLink href="/">Home</NuxtLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <NuxtLink href="/projects">Projects</NuxtLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{{ projectStore.project?.title || "Loading..." }}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <div class="max-w-7xl mx-auto">
    
      <template v-if="isPending">
        <div>Loading...</div>
      </template>

      <template v-else-if="isError">
        <div>{{ error }}</div>
      </template>

      <template v-else>
        <Card v-if="projectStore.project">
          <CardHeader>
            <div class="flex justify-between w-full">
              <CardTitle>{{ projectStore.project.title }}</CardTitle>
              <div class="flex items-center gap-3">
                <Button @click="openEditDialog" class="bg-blue-500 hover:bg-blue-600"> Edit </Button>
                <Button @click="handleDeleteProject" class="bg-red-500 hover:bg-red-600"> Delete </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent class="grid gap-4">
            <Tabs default-value="project">
              <TabsList>
                <TabsTrigger value="project">Project Details</TabsTrigger>
                <TabsTrigger value="tasks">Tasks ({{ projectStore.project.stats?.totalTasks }})</TabsTrigger>
              </TabsList>

              <TabsContent value="project">
                <div class="space-y-2">
                  <ProjectsDetail label="Category" :value="projectStore.project.category" />
                  <ProjectsDetail label="Budget" :value="String(projectStore.project.Budget)" />
                  <ProjectsDetail label="Due Date" :value="new Date(projectStore.project.due_date).toLocaleDateString()" />
                  <ProjectsDetail label="Start Date" :value="new Date(projectStore.project.start_date).toLocaleDateString()" />
                  <ProjectsDetail label="Description" :value="projectStore.project.description" />
                </div>
              </TabsContent>

              <TabsContent value="tasks">
                <div class="flex items-center justify-between space-y-2">
                  <div class="text-lg font-bold">Project Tasks</div>
                  <div class="flex items-center gap-2">
                    <div>
                      <Button @click="isAddTaskDialogOpen = true" class="bg-blue-500 hover:bg-blue-600"> + Add Task </Button>
                    </div>
                    <Select v-model="taskShow">
                    <SelectTrigger class="w-20">
                      <SelectValue placeholder="Select task" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Tasks</SelectLabel>
                        <SelectItem value="all"> All </SelectItem>
                        <SelectItem value="my"> My </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                    </div>

                </div>
                <div class="p-3 my-2" v-if="projectStore.project && projectStore.project.stats">
                  <div class="flex items-center justify-between gap-2">
                    <Progress v-model="projectStore.project.stats.progress" />
                    <div>{{ projectStore.project.stats.progress.toFixed(0) }}%</div>
                  </div>
                  <p>
                    {{ projectStore.project.stats.completedTasks }} /
                    {{ projectStore.project.stats.totalTasks }}
                  </p>
                </div>

                <div>
                  <TasksList :tasks="projectStore.projectTasks" :fromProject="true" />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter />
        </Card>
      </template>
    </div>
<!-- Add Task Dialog -->
<Dialog v-model:open="isAddTaskDialogOpen">
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
      </div>
      <div>
        <Label for="status">Status</Label>
        <Select v-model="newTask.status">
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
        <Select v-model="newTask.priority">
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
        <UserSelector v-model="selectedUsers" />
      </div>
      <div>
        <Label for="due_date">Due Date</Label>
        <Input id="due_date" type="date" v-model="newTask.due_date" />
      </div>
      <DialogFooter>
        <Button type="submit">Add Task</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
    <!-- Edit Project Dialog -->
    <Dialog v-model:open="isEditDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <form @submit.prevent="handleUpdateProject">
          <div class="space-y-4">
            <div>
              <Label for="title">Title</Label>
              <Input id="title" v-model="editedProject.title" required />
            </div>
            <div>
              <Label for="category">Category</Label>
              <Input id="category" v-model="editedProject.category" required />
            </div>
            <div>
              <Label for="description">Description</Label>
              <Textarea id="description" v-model="editedProject.description" />
            </div>
            <div>
              <Label for="budget">Budget</Label>
              <Input id="budget" v-model="editedProject.Budget" type="number" required />
            </div>
            <div>
              <Label for="start_date">Start Date</Label>
              <Input id="start_date" v-model="editedProject.start_date" type="date" required />
            </div>
            <div>
              <Label for="due_date">Due Date</Label>
              <Input id="due_date" v-model="editedProject.due_date" type="date" required />
            </div>
            <Button type="submit">Update Project</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
