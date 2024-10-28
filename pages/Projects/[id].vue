<script setup lang="ts">
import { useProjectStore } from "@/stores/project";
import { useProject } from "@/composables/useProject";
import { useRouter } from "vue-router";
import type { Project } from "@/types/project";

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
      start_date: projectStore.project.start_date,
      due_date: projectStore.project.due_date
    };
  }
  isEditDialogOpen.value = true;
};

const handleUpdateProject = async () => {
  if (!editedProject.value || !projectStore.project) return;
  try {
    // Create an object with only the changed fields
    const updatedFields = Object.entries(editedProject.value).reduce((acc, [key, value]) => {
      if (value !== projectStore.project![key as keyof Project]) {
        acc[key as keyof Project] = value;
      }
      return acc;
    }, {} as Partial<Project>);

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
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
              </TabsList>

              <TabsContent value="project">
                <div class="space-y-2">
                  <ProjectsDetail label="Category" :value="projectStore.project.category" />
                  <ProjectsDetail label="Budget" :value="String(projectStore.project.Budget)" />
                  <ProjectsDetail label="Due Date" :value="projectStore.project.due_date" />
                  <ProjectsDetail label="Start Date" :value="projectStore.project.start_date" />
                  <ProjectsDetail label="Description" :value="projectStore.project.description" />
                </div>
              </TabsContent>

              <TabsContent value="tasks">
                <div class="flex items-center justify-between space-y-2">
                  <div class="text-lg font-bold">Project Tasks</div>
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
                <div class="p-3 my-2">
                  <div class="flex items-center justify-between gap-2">
                    <Progress v-model="projectStore.project.stats.progress" />
                    <div>{{ projectStore.project.stats.progress }}%</div>
                  </div>
                  <p>
                    {{ projectStore.project.stats.completedTasks }} /
                    {{ projectStore.project.stats.totalTasks }}
                  </p>
                </div>

                <div>
                  <TasksList :tasks="projectStore.project.tasks" />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter />
        </Card>
      </template>
    </div>

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
