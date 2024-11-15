<script setup lang="ts">
import { useTaskStore } from "@/stores/tasks";
import { useTasks } from "@/composables/useTasks";
import { useUserStore } from "@/stores/user";
import { useUserDatabase } from "@/composables/useUserDatabase";
import type { Task, TaskWithProjectData } from "@/types/task";
import type { User } from "@/composables/useUserDatabase";
import { ref } from 'vue';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import html2canvas from 'html2canvas';
import { useAuthStore } from "@/stores/auth";
const authStore = useAuthStore();
const props = defineProps({
  tasks: {
    type: Array as () => TaskWithProjectData[],
    required: true,
  },
  fromProject: {
    type: Boolean,
    default: false
  }
});

const { toggleTaskCompletion } = useTasks();
const userStore = useUserStore();
const { fetchUsers } = useUserDatabase();

// Get user names from IDs
const getUserNames = (userIds: string[]) => {
  const users = userStore.getUsers;
  return userIds.map(id => {
    const user = users.find(u => u.userID === id);
    return user ? user.Name : id;
  }).join(", ");
};
const getCurrentUserName = () => {
  const currentUserId = authStore.sessionID;
  if (!currentUserId) return 'Unknown User';
  return getUserNames([currentUserId]);
};
// Get days left and color based on due date
const getDueDateInfo = (dueDate: string, completed: boolean) => {
  if (!dueDate) return { daysLeft: null, color: '', formattedDate: '' };
  
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const daysLeft = completed ? null : Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let color = '';
  if (completed) {
    color = 'text-gray-500'; // Completed tasks are always gray
  } else if (!daysLeft || daysLeft < 0) {
    color = 'text-red-500'; // Overdue
  } else if (daysLeft <= 2) {
    color = 'text-red-500'; // Due very soon
  } else if (daysLeft <= 5) {
    color = 'text-yellow-500'; // Due soon
  } else {
    color = 'text-green-500'; // Due later
  }

  const formattedDate = new Date(dueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return {
    daysLeft,
    color,
    formattedDate
  };
};

const getDaysLeftText = (info: ReturnType<typeof getDueDateInfo>) => {
  if (info.daysLeft === null) return '';
  return info.daysLeft >= 0 
    ? `${info.daysLeft} days left` 
    : `${Math.abs(info.daysLeft)} days overdue`;
};

const shareDialogOpen = ref(false);
const customMessage = ref('');
const currentTaskToShare = ref<TaskWithProjectData | null>(null);

const generateTaskImage = async (taskElement: HTMLElement): Promise<Blob | null> => {
  try {
    const canvas = await html2canvas(taskElement);
    return new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob));
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
};

const shareTask = async (task: TaskWithProjectData, event: MouseEvent) => {
  event.stopPropagation();
  currentTaskToShare.value = task;
  
  // Instead of looking for the task card, we'll capture the preview container
  const previewElement = document.querySelector('.preview-container.task-card') as HTMLElement;
  console.log('Preview element:', previewElement);
  if (!previewElement) {
    console.error('Preview element not found');
    return;
  }

  const blob = await generateTaskImage(previewElement);
  if (!blob) {
    console.error('Failed to generate image');
    return;
  }

  const file = new File([blob], 'task.png', { type: 'image/png' });
  const shareData = {
    title: `Task: ${task.title}`,
    text: customMessage.value ? `${customMessage.value}\n\nTask Details:\n${task.title}` : `Task Details:\n${task.title}`,
    url: window.location.origin + `/tasks/${task.$id}`,
    files: [file]
  };

  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      console.error('Error sharing:', err);
      // Fallback to download on share error
      downloadTaskImage(blob, task.$id);
    }
  } else {
    // Fallback for desktop or when Web Share API is not available
    downloadTaskImage(blob, task.$id);
  }
  
  shareDialogOpen.value = false;
  customMessage.value = '';
};

const downloadTaskImage = (blob: Blob, taskId: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `task-${taskId}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

const openShareDialog = (task: TaskWithProjectData, event: MouseEvent) => {
  event.stopPropagation();
  currentTaskToShare.value = task;
  shareDialogOpen.value = true;
};

// Fetch users when component mounts
onMounted(async () => {
  await fetchUsers();
});
</script>

<template>
  <div class="max-w-7xl mx-auto flex flex-col gap-4">
    <Card v-for="task in tasks" :key="task.$id" @click="navigateTo({path:`/tasks/${task.$id}`,query:{fromProject:String(fromProject)}})" class="cursor-pointer">
      <CardHeader>
        <CardTitle class="flex justify-between items-center">
          <div>
            <Checkbox :checked="task.completed" @update:checked="() => toggleTaskCompletion(task)" class="mr-2" @click="(e:Event) => e.stopPropagation()"/>
            {{ task.title }}
          </div>
          <div class="flex items-center gap-2">
            <Button variant="ghost" size="sm" @click="(e) => openShareDialog(task, e)">
              <Icon name="ri:share-box-line" class="mr-2" />
              Share
            </Button>
            <Badge>{{ task.priority }}</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>status: {{ task.status }}</div>
        <div>assigned to: {{ getUserNames(task.assigned_to) }}</div>
        <div>project: {{ task.project.title }}</div>
        <div>
          <div v-if="task.due_date" :class="getDueDateInfo(task.due_date, task.completed).color" class="text-sm font-bold">
                {{ getDueDateInfo(task.due_date, task.completed).formattedDate }}
                <span v-if="getDueDateInfo(task.due_date, task.completed).daysLeft !== null" class="ml-1">
                  ({{ getDaysLeftText(getDueDateInfo(task.due_date, task.completed)) }})
                </span>
              </div>
        </div>
      </CardContent>
    </Card>

    <Dialog v-model:open="shareDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Task</DialogTitle>
          <DialogDescription>Add a custom message to share with this task</DialogDescription>
        </DialogHeader>
        
        <div class="space-y-4">
          <Input
            v-model="customMessage"
            placeholder="Add a custom message (optional)"
            class="w-full"
          />
          
          <div class="preview-container task-card border rounded p-4 mb-4 bg-white">
            <h1 class="text-2xl font-bold">{{customMessage}}</h1>
            <div class="flex justify-between items-center mb-4">
         
              <h3 class="font-bold text-lg">{{ currentTaskToShare?.title }}</h3>
              <Badge v-if="currentTaskToShare?.priority">{{ currentTaskToShare.priority }}</Badge>
            </div>
            <div class="space-y-2">
              <p><span class="font-semibold">Status:</span> {{ currentTaskToShare?.status }}</p>
              <p><span class="font-semibold">Project:</span> {{ currentTaskToShare?.project.title }}</p>
              <p><span class="font-semibold">Due Date:</span> {{ currentTaskToShare?.due_date ? new Date(currentTaskToShare.due_date).toLocaleDateString() : 'No due date' }}</p>
              <p><span class="font-semibold">Assigned to:</span> {{ currentTaskToShare ? getUserNames(currentTaskToShare.assigned_to) : '' }}</p>
              <!-- calculate days left -->
              <p v-if="currentTaskToShare?.due_date" :class="getDueDateInfo(currentTaskToShare?.due_date, currentTaskToShare?.completed).color" class="text-sm font-bold"><span class="font-semibold">Days Left:</span> {{ currentTaskToShare ? getDaysLeftText(getDueDateInfo(currentTaskToShare.due_date, currentTaskToShare.completed)) : '' }}</p>
            </div>
            <div class="mt-8 my-3">
              <!-- logo -->
              <div class="flex items-center  gap-2">
                <span class="text-primary flex gap-2 items-center justify-center"> <img src="/img/logo_dark.png" alt="Comma Clan" class="w-10" /> <span class="hidden md:block">Comma</span></span>
                <span class="sr-only">Comma Clan</span>
              </div>
            
            </div>
              <!-- todays date and time and shared by username -->
              <div class="text-sm text-muted-foreground">
                <div><span class="font-bold">Shared by:</span> <span class="font-bold">{{ getCurrentUserName() }}  </span></div>
                <span class="font-bold">Shared on:</span> <span class="font-bold">{{ new Date().toLocaleDateString() }} {{ new Date().toLocaleTimeString() }}</span>
              </div>
          </div>

          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="shareDialogOpen = false">Cancel</Button>
            <Button @click="(e) => currentTaskToShare && shareTask(currentTaskToShare, e)">
              Share Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
