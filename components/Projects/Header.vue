<script setup lang="ts">
import { ref } from 'vue';
import { useProjects } from "@/composables/useProjects";

let projectStatus = ref("pending");
let projectShow = ref("all");
const isDialogOpen = ref(false);
const newProject = ref({
  title: '',
  category: '',
  description: '',
  due_date: '',
  start_date: '',
  Budget: 0,
  status: 'pending'
});

const { addProject } = useProjects();

const handleAddProject = async () => {
  try {
    await addProject(newProject.value);
    isDialogOpen.value = false;
    // Reset form
    newProject.value = {
      title: '',
      category: '',
      description: '',
      due_date: '',
      start_date: '',
      Budget: 0,
      status: 'pending'
    };
  } catch (error) {
    console.error('Failed to add project:', error);
  }
};
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between w-full">
      <h1 class="text-2xl font-bold">Projects</h1>
      <Button @click="isDialogOpen = true"> + Add Project </Button>
    </div>
    <div class="flex items-center justify-between ">
      <div class="flex items-center gap-3">
        <Select v-model="projectStatus">
          <SelectTrigger>
            <SelectValue placeholder="Select project Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value="pending"> Pending </SelectItem>
              <SelectItem value="finished"> completed </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select v-model="projectShow">
          <SelectTrigger>
            <SelectValue placeholder="Select project Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value="all"> All </SelectItem>
              <SelectItem value="my"> My </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>

    <Dialog v-model:open="isDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Project</DialogTitle>
          <DialogDescription>
            Add a new project to your list.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleAddProject" class="space-y-4">
          <div>
            <Label for="title">Title</Label>
            <Input id="title" v-model="newProject.title" required />
          </div>
          <div>
            <Label for="category">Category</Label>
            <Input id="category" v-model="newProject.category" required />
          </div>
          <div>
            <Label for="description">Description</Label>
            <Textarea id="description" v-model="newProject.description" />
          </div>
          <div>
            <Label for="start_date">Start Date</Label>
            <Input id="start_date" v-model="newProject.start_date" type="date" required />
          </div>
          <div>
            <Label for="due_date">Due Date</Label>
            <Input id="due_date" v-model="newProject.due_date" type="date" required />
          </div>
          <div>
            <Label for="budget">Budget</Label>
            <Input id="budget" v-model="newProject.Budget" type="number" required />
          </div>
          <div>
            <Label for="status">Status</Label>
            <Select v-model="newProject.status">
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">Add Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
